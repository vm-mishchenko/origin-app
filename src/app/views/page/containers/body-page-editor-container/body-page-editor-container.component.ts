import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IWallDefinition} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {filter, first, map, switchMap} from 'rxjs/internal/operators';
import {PageRepositoryService, PageService} from '../../../../features/page';

@Component({
    selector: 'app-body-page-editor-container',
    templateUrl: './body-page-editor-container.component.html',
    styleUrls: ['./body-page-editor-container.component.scss']
})
export class BodyPageEditorContainerComponent implements OnInit, OnDestroy {
    @Input() selectedPageId$: Observable<string>;
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

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
