import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IWallDefinition, WallModelFactory} from 'ngx-wall';
import {Observable, Subscription} from 'rxjs';
import {filter, first, map, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
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
    selectedPageId: string;
    selectedPageId$: Observable<string>;
    selectedPageIdentityTitle$: Observable<string>;

    subscriptions: Subscription[] = [];

    // ui
    pageForm: FormGroup;

    // for child
    pageBody: IWallDefinition;

    constructor(private route: ActivatedRoute,
                private navigationService: NavigationService,
                private pageService: PageService,
                private formBuilder: FormBuilder,
                private wallModelFactory: WallModelFactory,
                private pageRepositoryService: PageRepositoryService) {
        this.pageForm = this.formBuilder.group({
            title: this.formBuilder.control('')
        });
    }

    ngOnInit() {
        this.selectedPageId$ = this.route.params.pipe(
            map((params) => params.id),
            shareReplay()
        );

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
                this.selectedPageId = pageId;

                Promise.all([
                    this.pageRepositoryService.loadIdentityPage(pageId),
                    this.pageRepositoryService.loadBodyPage(pageId),
                    this.pageRepositoryService.loadTreePageChildren(pageId)
                ]).catch((e) => {
                    this.navigationService.toPageHome();
                });
            })
        );

        // todo: consider move it to page service
        // extracting entity by id
        this.selectedPageIdentityTitle$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageRepositoryService.pageIdentity$.pipe(
                    filter((pageIdentity) => Boolean(pageIdentity[selectedPagedId])),
                    map((pageIdentity) => pageIdentity[selectedPagedId].title)
                );
            }),
            shareReplay()
        );

        // page title editor -> database
        this.subscriptions.push(
            this.pageForm.valueChanges.pipe(
                withLatestFrom(this.selectedPageIdentityTitle$),
                filter(([formValues, selectedPageIdentityTitle]) => Boolean(selectedPageIdentityTitle !== formValues.title))
            ).subscribe(([formValues]) => {
                this.pageService.updatePageIdentity({
                    id: this.selectedPageId,
                    title: formValues.title
                });
            })
        );

        // page title database -> editor
        this.subscriptions.push(
            this.selectedPageIdentityTitle$.pipe(
                filter((selectedPageIdentityTitle) => selectedPageIdentityTitle !== this.pageForm.get('title').value)
            ).subscribe((selectedPageIdentityTitle) => {
                this.pageForm.patchValue({
                    title: selectedPageIdentityTitle
                });
            })
        );

        // body database -> editor
        this.subscriptions.push(
            this.selectedPageId$.pipe(
                switchMap((selectedPagedId) => {
                    return this.pageRepositoryService.pageBody$.pipe(
                        filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                        map((pageBody) => pageBody[selectedPagedId]),
                        first()
                    );
                }),
                tap((bodyPage) => {
                    this.pageBody = bodyPage.body;
                })
            ).subscribe()
        );
    }

    onHeaderEnterHandler() {
    }

    pageBodyUpdated(bodyPage: IWallDefinition) {
        // body editor -> database
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
