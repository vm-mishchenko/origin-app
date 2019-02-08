import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {filter, map, shareReplay, tap, withLatestFrom} from 'rxjs/operators';
import {NavigationService} from '../../../../features/navigation';
import {PageRepositoryService} from '../../../../features/page';
import {DeletePageEvent} from '../../../../features/page/page-events.type';
import {PageService} from '../../../../features/page/page.service';

@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-view-container.component.html',
    styleUrls: ['./page-editor-view-container.component.scss']
})
export class PageEditorViewContainerComponent implements OnInit, OnDestroy {
    selectedPageId$: Observable<string>;
    subscriptions: Subscription[] = [];

    constructor(private route: ActivatedRoute,
                private navigationService: NavigationService,
                private pageService: PageService,
                private wallModelFactory: WallModelFactory,
                private pageRepositoryService: PageRepositoryService) {
        this.selectedPageId$ = this.route.params.pipe(
            map((params) => params.id),
            shareReplay()
        );
    }

    ngOnInit() {
        // navigation after selected page was deleted
        this.subscriptions.push(
            this.pageService.events$.pipe(
                filter((e) => e instanceof DeletePageEvent),
                map((e) => e.pageId),
                withLatestFrom((this.selectedPageId$)),
                tap(([deletedPageId, selectedPageId]) => {
                    // todo: consider more cases
                    // if deleted page is child of selected page
                    // if deleted page is deep child of selected page
                    // if deleted page is parent of selected page
                    // if deleted page is deep parent of selected page

                    this.navigationService.toPageHome();
                })
            ).subscribe()
        );

        // loading page after selected page was changed
        this.subscriptions.push(
            this.selectedPageId$.subscribe((pageId) => {
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

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
