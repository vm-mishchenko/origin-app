import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IWallDefinition, RemoveBricksEvent, TurnBrickIntoEvent} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {concat, filter, first, map, pairwise, shareReplay, switchMap, tap} from 'rxjs/operators';
import {PageService} from '../../../repository';
import {PageRepositoryService2} from '../../../repository/page-repository.service2';
import {PAGE_BRICK_TAG_NAME} from '../../../ui/page-ui.constant';
import {PageEditorComponent} from '../../components/editor/page-editor.component';
import {PageViewQuery} from '../../state/page-view.query';
import {PageViewStore} from '../../state/page-view.store';

@Component({
    selector: 'app-body-page-editor-container',
    templateUrl: './page-body-editor-container.component.html',
    styleUrls: ['./page-body-editor-container.component.scss']
})
export class PageBodyEditorContainerComponent implements OnInit, OnDestroy {
    @Input() scrollableContainer: HTMLElement;

    pageBody$: Observable<IWallDefinition>;

    private currentBody: string = null;
    private selectedPageId: string;
    private subscriptions: Subscription[] = [];

    @ViewChild(PageEditorComponent) pageEditorComponent: PageEditorComponent;

    constructor(private pageRepositoryService2: PageRepositoryService2,
                private pageService: PageService,
                public pageViewQuery: PageViewQuery,
                private pageViewStore: PageViewStore) {
    }

    ngOnInit() {
        this.subscriptions.push(
            this.pageViewQuery.selectedPageId$.subscribe((pageId) => {
                this.selectedPageId = pageId;
            })
        );

        // database -> editor
        this.pageBody$ = this.pageViewQuery.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                // initial pageBody rendering
                // emit event as soon as first selected page body-editor is come
                const initialSelectedPageBodyChange = this.pageRepositoryService2.selectPageBody(selectedPagedId).pipe(
                  filter((pageBodySnapshot) => pageBodySnapshot.exists),
                  first(),
                  tap((bodyPage) => {
                      this.updateCurrentBody(bodyPage.data().body);
                  }));

                // listen for following (after first) page body-editor changes
                // compare previous and current body-editor change to determine
                // whether new body-editor from the storage should be rendered
                const nextSelectedPageBodyChange = this.pageRepositoryService2.selectPageBody(selectedPagedId).pipe(
                  filter((pageBodySnapshot) => pageBodySnapshot.exists),
                  pairwise(),
                  filter(([previousPageBodySnapshot, newPageBodySnapshot]) => {
                      const newBody = newPageBodySnapshot.data().body;

                      return this.currentBody !== JSON.stringify(newBody);
                    }),
                  map(([previousPageBodySnapshot, currentPageBodySnapshot]) => currentPageBodySnapshot)
                );

                return initialSelectedPageBodyChange.pipe(
                    concat(nextSelectedPageBodyChange)
                );
            }),
          map((bodyPage) => bodyPage.data().body),
            shareReplay()
        );
    }

    // editor -> database
    pageBodyUpdated(bodyPage: IWallDefinition) {
        this.updateCurrentBody(bodyPage);

        this.pageService.updatePageBody2(this.selectedPageId, {
            body: bodyPage
        });
    }

    wallEvents(event: any) {
        if (event instanceof RemoveBricksEvent) {
            const pageIds = event.bricks.filter((brick) => brick.tag === PAGE_BRICK_TAG_NAME)
                .map((brick) => brick.state.pageId);

            this.pageService.removePages2(pageIds);
        }

        if (event instanceof TurnBrickIntoEvent && event.newTag === PAGE_BRICK_TAG_NAME) {
            this.pageService.createPage2(this.selectedPageId, {
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
