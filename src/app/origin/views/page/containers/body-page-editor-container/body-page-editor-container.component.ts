import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {IWallDefinition, RemoveBricksEvent, TurnBrickIntoEvent} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {concat, filter, first, map, pairwise, shareReplay, switchMap, tap} from 'rxjs/operators';
import {PageRepositoryService, PageService} from '../../../../../features/page';
import {PAGE_BRICK_TAG_NAME} from '../../../../../features/page-ui/page-ui.constant';
import {PageEditorComponent} from '../../components/page-editor/page-editor.component';

@Component({
    selector: 'app-body-page-editor-container',
    templateUrl: './body-page-editor-container.component.html',
    styleUrls: ['./body-page-editor-container.component.scss']
})
export class BodyPageEditorContainerComponent implements OnInit, OnDestroy {
    @Input() selectedPageId$: Observable<string>;
    @Input() scrollableContainer: HTMLElement;
    @Output() selectedBrickIds: EventEmitter<string[]> = new EventEmitter();
    pageBody$: Observable<IWallDefinition>;
    private currentBody: string = null;

    @ViewChild(PageEditorComponent) pageEditorComponent: PageEditorComponent;

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

        // database -> editor
        this.pageBody$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                // initial pageBody rendering
                // emit event as soon as first selected page body is come
                const initialSelectedPageBodyChange = this.pageRepositoryService.pageBody$.pipe(
                    filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                    map((pageBody) => pageBody[selectedPagedId]),
                    first(),
                    tap((bodyPage) => {
                        this.updateCurrentBody(bodyPage.body);
                    }));

                // listen for following (after first) page body changes
                // compare previous and current body change to determine
                // whether new body from the storage should be rendered
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
        this.selectedBrickIds.emit(selectedBrickIds);
    }

    // public API
    focusOnPageEditor() {
        this.pageEditorComponent.focusOnPageEditor();
    }

    private updateCurrentBody(body: IWallDefinition) {
        this.currentBody = JSON.stringify(body);
    }
}
