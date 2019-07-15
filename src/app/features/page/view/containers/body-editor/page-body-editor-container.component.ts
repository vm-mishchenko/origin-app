import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IWallDefinition, RemoveBricksEvent, TurnBrickIntoEvent} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {concat, filter, first, map, pairwise, shareReplay, switchMap, tap} from 'rxjs/operators';
import {PageRepositoryService, PageService} from '../../../repository';
import {PAGE_BRICK_TAG_NAME} from '../../../ui/page-ui.constant';
import {PageEditorComponent} from '../../components/editor/page-editor.component';
import {PageViewStore} from '../../state/page-view.store';

@Component({
    selector: 'app-body-page-editor-container',
    templateUrl: './page-body-editor-container.component.html',
    styleUrls: ['./page-body-editor-container.component.scss']
})
export class PageBodyEditorContainerComponent implements OnInit, OnDestroy {
    @Input() selectedPageId$: Observable<string>;
    @Input() scrollableContainer: HTMLElement;

    pageBody$: Observable<IWallDefinition>;

    private currentBody: string = null;
    private selectedPageId: string;
    private subscriptions: Subscription[] = [];

    @ViewChild(PageEditorComponent) pageEditorComponent: PageEditorComponent;

    constructor(private pageRepositoryService: PageRepositoryService,
                private pageService: PageService,
                private pageViewStore: PageViewStore) {
    }

    ngOnInit() {
        this.subscriptions.push(
            this.selectedPageId$.subscribe((pageId) => {
                this.selectedPageId = pageId;
            })
        );

        // database -> editor
        this.pageBody$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                // initial pageBody rendering
                // emit event as soon as first selected page body-editor is come
                const initialSelectedPageBodyChange = this.pageRepositoryService.pageBody$.pipe(
                    filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                    map((pageBody) => pageBody[selectedPagedId]),
                    first(),
                    tap((bodyPage) => {
                        this.updateCurrentBody(bodyPage.body);
                    }));

                // listen for following (after first) page body-editor changes
                // compare previous and current body-editor change to determine
                // whether new body-editor from the storage should be rendered
                const nextSelectedPageBodyChange = this.pageRepositoryService.pageBody$.pipe(
                    filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                    pairwise(),
                    filter(([previousPageBody, newPageBody]) => {
                        const newBody = newPageBody[selectedPagedId].body;

                        return this.currentBody !== JSON.stringify(newBody);
                    }),
                    map(([previousPageBody, currentPageBody]) => currentPageBody[selectedPagedId])
                );

                return initialSelectedPageBodyChange.pipe(
                    concat(nextSelectedPageBodyChange)
                );
            }),
            map((bodyPage) => bodyPage.body),
            shareReplay()
        );
    }

    // editor -> database
    pageBodyUpdated(bodyPage: IWallDefinition) {
        this.updateCurrentBody(bodyPage);

        this.pageService.updatePageBody({
            id: this.selectedPageId,
            body: bodyPage
        });
    }

    wallEvents(event: any) {
        if (event instanceof RemoveBricksEvent) {
            const pageIds = event.bricks.filter((brick) => brick.tag === PAGE_BRICK_TAG_NAME)
                .map((brick) => brick.state.pageId);

            this.pageService.removePages(pageIds);
        }

        if (event instanceof TurnBrickIntoEvent && event.newTag === PAGE_BRICK_TAG_NAME) {
            this.pageService.createPage(this.selectedPageId, {
                pageBrickId: event.brickId
            });
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    onSelectedBrickIds(selectedBrickIds: string[]) {
        this.pageViewStore.setSelectedBrickIds(selectedBrickIds);
    }

    // public API
    focusOnPageEditor() {
        this.pageEditorComponent.focusOnPageEditor();
    }

    private updateCurrentBody(body: IWallDefinition) {
        this.currentBody = JSON.stringify(body);
    }
}
