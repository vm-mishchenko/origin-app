import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IWallDefinition, WallModelFactory} from 'ngx-wall';
import {Observable, Subject, Subscription} from 'rxjs';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {filter, first, map, mergeMap, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {NavigationService} from '../../../../features/navigation';
import {PageRepositoryService} from '../../../../features/page';
import {DeletePageEvent} from '../../../../features/page/page-events.type';
import {PageService} from '../../../../features/page/page.service';
import {IIdentityPage} from '../../../../features/page/page.types';

@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-view-container.component.html',
    styleUrls: ['./page-editor-view-container.component.scss']
})
export class PageEditorViewContainerComponent implements OnInit, OnDestroy {
    selectedPageId: string;
    selectedPageId$: Observable<string>;
    selectedPageIdentity$: Observable<IIdentityPage>;

    subscriptions: Subscription[] = [];

    // ui
    pageForm: FormGroup;
    bodyPage$: Observable<IWallDefinition> = new Subject<IWallDefinition>();

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
        this.selectedPageIdentity$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageRepositoryService.pageIdentity$.pipe(
                    filter((pageIdentity) => Boolean(pageIdentity[selectedPagedId])),
                    map((pageIdentity) => pageIdentity[selectedPagedId])
                );
            }),
            shareReplay()
        );

        // clean up subscription
        this.pageForm.valueChanges.pipe(
            withLatestFrom(this.selectedPageIdentity$),
            filter(([formValues, selectedPageIdentity]) => Boolean(selectedPageIdentity.title !== formValues.title))
        ).subscribe(([formValues, selectedPageIdentity]) => {
            this.pageService.updatePageIdentity({
                id: selectedPageIdentity.id,
                title: formValues.title
            });
        });

        this.subscriptions.push(
            this.selectedPageIdentity$.pipe(
                filter((selectedPageIdentity) => selectedPageIdentity.title !== this.pageForm.get('title').value)
            ).subscribe((selectedPageIdentity) => {
                this.pageForm.patchValue({
                    title: selectedPageIdentity.title
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


        // body editor -> database
        this.subscriptions.push(
            this.bodyPage$.pipe(
                withLatestFrom(this.selectedPageId$)
            ).subscribe(([bodyPage, selectedPageId]) => {
                this.pageService.updatePageBody({
                    id: selectedPageId,
                    body: bodyPage
                });
            })
        );
    }

    onHeaderEnterHandler() {
    }

    pageBodyUpdated(bodyPage: IWallDefinition) {
        (this.bodyPage$ as Subject<IWallDefinition>).next(bodyPage);
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
