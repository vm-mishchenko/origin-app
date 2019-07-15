import {ComponentPortal} from '@angular/cdk/portal';
import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WallModelFactory} from 'ngx-wall';
import {Subscription} from 'rxjs';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {NavigationService} from '../../../../../modules/navigation';
import {ShellContainerComponent} from '../../../../shell/view';
import {ShellStore} from '../../../../shell/view/state/shell.store';
import {PageConfigRepositoryService} from '../../../config/page-config-repository.service';
import {PageConfigStorageService} from '../../../config/page-config-storage.service';
import {PageRepositoryService, PageService} from '../../../repository';
import {DeletePageEvent} from '../../../repository/page-events.type';
import {PageViewQuery} from '../../state/page-view.query';
import {PageViewStore} from '../../state/page-view.store';
import {PageBodyEditorContainerComponent} from '../body-editor/page-body-editor-container.component';
import {PageEditorMainMenuComponent} from '../editor-main-menu/page-editor-main-menu.component';
import {PageMenuContainerComponent} from '../menu/page-menu-container.component';


/**
 * Container around page title and body editors.
 */
@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-container.component.html',
    styleUrls: ['./page-editor-container.component.scss']
})
export class PageEditorContainerComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    @ViewChild(PageBodyEditorContainerComponent) bodyPageEditorContainer: PageBodyEditorContainerComponent;

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
                private pageConfigStorageService: PageConfigStorageService,
                private pageConfigRepositoryService: PageConfigRepositoryService,
                public pageViewQuery: PageViewQuery) {
        this.shellContainerComponent.setMainPortalComponent(
            new ComponentPortal(
                PageEditorMainMenuComponent,
                /* ViewContainerRef = */ undefined,
                /* injector = */ undefined,
                this.componentFactoryResolver
            )
        );

        this.shellContainerComponent.setSecondaryPortalComponent(
            new ComponentPortal(
                PageMenuContainerComponent,
                /* ViewContainerRef = */ undefined,
                /* injector = */ undefined,
                this.componentFactoryResolver
            )
        );

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
                    // load selected page config
                    this.pageConfigRepositoryService.load(pageId),

                    // loading page after selected page was changed
                    this.pageRepositoryService.loadIdentityPage(pageId),
                    this.pageRepositoryService.loadBodyPage(pageId),
                    this.pageRepositoryService.loadTreePageChildren(pageId)
                ]).catch((e) => {
                    this.navigationService.toPageHome();
                });
            })
        );
    }

    /**
     * Focus to page body after Enter press on page title.
     */
    onHeaderEnterHandler() {
        this.bodyPageEditorContainer.focusOnPageEditor();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        this.shellContainerComponent.clearMainPortal();
        this.shellContainerComponent.clearSecondaryPortal();

        this.pageViewStore.setSelectedPageId(null);
    }
}
