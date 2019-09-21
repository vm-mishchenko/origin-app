import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IWallDefinition2, TransactionEvent} from 'ngx-wall';
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

    pageBody$: Observable<IWallDefinition2>;

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
    pageBodyUpdated(bodyPage: IWallDefinition2) {
        this.updateCurrentBody(bodyPage);

        this.pageService.updatePageBody2(this.selectedPageId, {
            body: bodyPage
        });
    }

    onWallEvents(event: TransactionEvent) {
        const removedPageBrickIds = event.transaction.change.removed.filter((removedChange) => {
            return removedChange.brickSnapshot.tag === PAGE_BRICK_TAG_NAME;
        }).map((pageRemovedChange) => {
            return pageRemovedChange.brickSnapshot.id;
        });

        this.pageService.removePages2(removedPageBrickIds);

        event.transaction.change.turned.filter((turnedBrickChange) => {
            return turnedBrickChange.newTag === PAGE_BRICK_TAG_NAME;
        }).map((turnedToPageBrickChange) => {
            return turnedToPageBrickChange.brickId;
        }).forEach((newPageBrick) => {
            this.pageService.createPage2(this.selectedPageId, {
                pageBrickId: newPageBrick
            });
        });
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

    private updateCurrentBody(body: IWallDefinition2) {
        this.currentBody = JSON.stringify(body);
    }
}
