import {MediaMatcher} from '@angular/cdk/layout';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WallModelFactory} from 'ngx-wall';
import {Subscription} from 'rxjs';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {NavigationService} from '../../../../navigation';
import {PageRepositoryService, PageService} from '../../../repository';
import {DeletePageEvent} from '../../../repository/page-events.type';
import {OriginPageService} from '../../../../../origin/modules/origin-page';
import {PageViewStore} from '../../state/page-view.store';
import {PageBodyEditorContainerComponent} from '../body-editor/page-body-editor-container.component';

@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-container.component.html',
    styleUrls: ['./page-editor-container.component.scss']
})
export class PageEditorContainerComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];
    selectedBrickIds: string[] = [];

    @ViewChild(PageBodyEditorContainerComponent) bodyPageEditorContainer: PageBodyEditorContainerComponent;

    constructor(media: MediaMatcher,
                private route: ActivatedRoute,
                private navigationService: NavigationService,
                private pageService: PageService,
                private wallModelFactory: WallModelFactory,
                private pageRepositoryService: PageRepositoryService,
                private pageViewStore: PageViewStore,
                public originPageService: OriginPageService) {
        const mobileQuery = media.matchMedia('(max-width: 600px)');

        this.subscriptions.push(
            this.route.params.pipe(
                map((params) => params.id)
            ).subscribe((pageId) => {
                this.originPageService.setSelectedPageId(pageId);

                if (mobileQuery.matches) {
                    this.pageViewStore.closeMenu();
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
                withLatestFrom((this.originPageService.selectedPageId$)),
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
            this.originPageService.selectedPageId$.subscribe((pageId) => {
                Promise.all([
                    this.pageRepositoryService.loadIdentityPage(pageId),
                    this.pageRepositoryService.loadBodyPage(pageId),
                    this.pageRepositoryService.loadTreePageChildren(pageId)
                ]).catch((e) => {
                    this.navigationService.toPageHome();
                });
            })
        );
    }

    onHeaderEnterHandler() {
        this.bodyPageEditorContainer.focusOnPageEditor();
    }

    movePageTo() {
        const targetPageId = window.prompt('Target page id');

        if (targetPageId) {
            this.pageService.movePage(this.originPageService.selectedPageId, targetPageId);
        }
    }

    moveBricksTo() {
        const targetPageId = window.prompt('Target page id');

        if (targetPageId) {
            this.pageService.moveBricks(this.originPageService.selectedPageId,
                this.selectedBrickIds,
                targetPageId);
        }
    }

    removePage() {
        if (confirm('Are you sure?')) {
            this.pageService.removePage(this.originPageService.selectedPageId);
        }
    }

    onSelectedBrickIds(selectedBrickIds: string[]) {
        this.selectedBrickIds = selectedBrickIds;
    }

    ngOnDestroy() {
        this.originPageService.setSelectedPageId(null);

        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
