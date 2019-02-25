import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IWallDefinition, RemoveBricksEvent} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {filter, first, map, switchMap} from 'rxjs/operators';
import {PageRepositoryService, PageService} from '../../../../../features/page';
import {PAGE_BRICK_TAG_NAME} from '../../../../../features/page-ui/page-ui.constant';

@Component({
    selector: 'app-body-page-editor-container',
    templateUrl: './body-page-editor-container.component.html',
    styleUrls: ['./body-page-editor-container.component.scss']
})
export class BodyPageEditorContainerComponent implements OnInit, OnDestroy {
    @Input() selectedPageId$: Observable<string>;
    @Input() scrollableContainer: HTMLElement;
    pageBody$: Observable<IWallDefinition>;

    private selectedPageId: string;
    private subscriptions: Subscription[] = [];

    constructor(private pageRepositoryService: PageRepositoryService,
                private pageService: PageService) {
    }

    ngOnInit() {
        this.subscriptions.push(
            this.selectedPageId$.subscribe((pageId) => {
                this.selectedPageId = pageId;
            })
        );

        // body database -> editor
        this.pageBody$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageRepositoryService.pageBody$.pipe(
                    filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                    map((pageBody) => pageBody[selectedPagedId]),
                    first()
                );
            }),
            map((bodyPage) => bodyPage.body)
        );
    }

    // body editor -> database
    pageBodyUpdated(bodyPage: IWallDefinition) {
        this.pageService.updatePageBody({
            id: this.selectedPageId,
            body: bodyPage
        });
    }

    pageBrickIdProvider(): Promise<string> {
        return this.pageService.createPage(this.selectedPageId);
    }

    wallEvents(event: any) {
        if (event instanceof RemoveBricksEvent) {
            const pageIds = event.bricks.filter((brick) => brick.tag === PAGE_BRICK_TAG_NAME)
                .map((brick) => brick.state.pageId);

            this.pageService.removePages(pageIds);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
