import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WallModelFactory} from 'ngx-wall';
import {Subscription} from 'rxjs';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {NavigationService} from '../../../../../modules/navigation';
import {PageRepositoryService, PageService} from '../../../repository';
import {DeletePageEvent} from '../../../repository/page-events.type';
import {PageBodyEditorContainerComponent} from '../body-editor/page-body-editor-container.component';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {ShellStore} from '../../../../shell/view/state/shell.store';
import {PageViewStore} from '../../state/page-view.store';
import {PageViewQuery} from '../../state/page-view.query';
import {ShellContainerComponent} from '../../../../shell/view';
import {PageBreadcrumbsContainerComponent} from '../breadcrumbs/page-breadcrumbs-container.component';
import {ComponentPortal} from '@angular/cdk/portal';

@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-container.component.html',
    styleUrls: ['./page-editor-container.component.scss']
})
export class PageEditorContainerComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];
    selectedBrickIds: string[] = [];

    constructor(private route: ActivatedRoute,
                private navigationService: NavigationService,
                private pageService: PageService,
                private wallModelFactory: WallModelFactory,
                private pageRepositoryService: PageRepositoryService,
                private deviceLayoutService: DeviceLayoutService,
                private shellStore: ShellStore,
                private pageViewStore: PageViewStore,
                private shellContainerComponent: ShellContainerComponent,
                private componentFactoryResolver: ComponentFactoryResolver,
                public pageViewQuery: PageViewQuery) {
        this.subscriptions.push(
            this.route.params.pipe(
                map((params) => params.id)
            ).subscribe((pageId) => {
                this.pageViewStore.setSelectedPageId(pageId);

                if (this.deviceLayoutService.isMobileLayout()) {
                    this.shellStore.closeMenu();
                }
            })
        );
    }

    @ViewChild(PageBodyEditorContainerComponent) bodyPageEditorContainer: PageBodyEditorContainerComponent;

    ngOnInit() {
        // navigation after selected page was deleted
        this.subscriptions.push(
            this.pageService.events$.pipe(
                filter((e) => e instanceof DeletePageEvent),
                map((e) => e.pageId),
                withLatestFrom((this.pageViewQuery.selectedPageId$)),
                tap(([deletedPageId, selectedPageId]) => {
                    // todo: consider more cases
                    // if deleted page is child of selected page
                    // if deleted page is deep child of selected page
                    // if deleted page is parent of selected page
                    // if deleted page is deep parent of selected page

                    if (deletedPageId === selectedPageId) {
                        this.navigationService.toPageHome();
                    }
                })
            ).subscribe()
        );

        // loading page after selected page was changed
        this.subscriptions.push(
            this.pageViewQuery.selectedPageId$.pipe(
                filter((selectedPageId) => Boolean(selectedPageId))
            ).subscribe((pageId) => {
                Promise.all([
                    this.pageRepositoryService.loadIdentityPage(pageId),
                    this.pageRepositoryService.loadBodyPage(pageId),
                    this.pageRepositoryService.loadTreePageChildren(pageId)
                ]).catch((e) => {
                    this.navigationService.toPageHome();
                });
            })
        );

        this.shellContainerComponent.setMainPortalComponent(
            new ComponentPortal(
                PageBreadcrumbsContainerComponent,
                /* ViewContainerRef = */ undefined,
                /* injector = */ undefined,
                this.componentFactoryResolver
            )
        );
    }

    onHeaderEnterHandler() {
        this.bodyPageEditorContainer.focusOnPageEditor();
    }

    movePageTo() {
        const targetPageId = window.prompt('Target page id');

        if (targetPageId) {
            this.pageService.movePage(this.pageViewQuery.getSelectedPageId(), targetPageId);
        }
    }

    moveBricksTo() {
        const targetPageId = window.prompt('Target page id');

        if (targetPageId) {
            this.pageService.moveBricks(this.pageViewQuery.getSelectedPageId(),
                this.selectedBrickIds,
                targetPageId);
        }
    }

    removePage() {
        if (confirm('Are you sure?')) {
            this.pageService.removePage(this.pageViewQuery.getSelectedPageId());
        }
    }

    onSelectedBrickIds(selectedBrickIds: string[]) {
        this.selectedBrickIds = selectedBrickIds;
    }

    ngOnDestroy() {
        this.pageViewStore.setSelectedPageId(null);

        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        this.shellContainerComponent.clearMainPortal();
    }
}
