import {Component, Injector, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {
    BeforeChangeEvent,
    CopyPlugin,
    IWallDefinition,
    IWallModel,
    SelectionPlugin,
    SetPlanEvent,
    TurnBrickIntoEvent,
    UNDO_REDO_API_NAME,
    UndoRedoPlugin,
    WallModelFactory
} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {filter, first, map, mergeMap, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {NavigationService} from '../../../../features/navigation';
import {IPageBrickState} from '../../../../features/page-ui/bricks/page-brick/page-brick.types';
import {DeletePageEvent} from '../../../../features/page/page-events.type';
import {PageService} from '../../../../features/page/page.service';
import {IIdentityPage} from '../../../../features/page/page.types';

@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-view-container.component.html',
    styleUrls: ['./page-editor-view-container.component.scss']
})
export class PageEditorViewContainerComponent implements OnInit {
    selectedPageId$: Observable<string>;
    selectedPageIdentity$: Observable<IIdentityPage>;

    // ui
    pageForm: FormGroup;
    wallModel: IWallModel;
    bodyPage$: Observable<IWallDefinition> = new Subject<IWallDefinition>();
    newBrickPageId$: Observable<string> = new Subject<string>();

    constructor(private route: ActivatedRoute,
                private navigationService: NavigationService,
                private pageService: PageService,
                private formBuilder: FormBuilder,
                private wallModelFactory: WallModelFactory,
                private injector: Injector) {
        this.pageForm = this.formBuilder.group({
            title: this.formBuilder.control('')
        });

        // initialize wall model
        this.wallModel = this.wallModelFactory.create({
            plugins: [
                new CopyPlugin(this.injector),
                new UndoRedoPlugin(this.injector),
                new SelectionPlugin(this.injector)
            ]
        });
    }

    ngOnInit() {
        this.selectedPageId$ = this.route.params.pipe(
            map((params) => params.id),
            shareReplay()
        );

        this.pageService.events$.pipe(
            filter((e) => e instanceof DeletePageEvent),
            map((e) => e.pageId),
            withLatestFrom((this.selectedPageId$)),
            filter(([deletedPageId, selectedPageId]) => deletedPageId === selectedPageId)
        ).subscribe(() => {
            this.navigationService.toPageHome();
        });

        // todo: clean up subscription
        this.selectedPageId$.subscribe((pageId) => {
            Promise.all([
                this.pageService.loadIdentityPage(pageId),
                this.pageService.loadBodyPage(pageId),
                this.pageService.loadTreePageChildren(pageId)
            ]).catch((e) => {
                this.navigationService.toPageHome();
            });
        });

        // todo: consider move it to page service
        // extracting entity by id
        this.selectedPageIdentity$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageService.pageIdentity$.pipe(
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

        // todo: clean up subscription
        this.selectedPageIdentity$.pipe(
            filter((selectedPageIdentity) => selectedPageIdentity.title !== this.pageForm.get('title').value)
        ).subscribe((selectedPageIdentity) => {
            this.pageForm.patchValue({
                title: selectedPageIdentity.title
            });
        });

        this.wallModel.api.core.subscribe((event) => {
            if (event instanceof TurnBrickIntoEvent && event.newTag === 'page') {
                (this.newBrickPageId$ as Subject<string>).next(event.brickId);
            }

            if (!(event instanceof SetPlanEvent) && !(event instanceof BeforeChangeEvent)) {
                (this.bodyPage$ as Subject<IWallDefinition>).next(this.wallModel.api.core.getPlan());
            }
        });

        // body database -> editor
        this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageService.pageBody$.pipe(
                    filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                    map((pageBody) => pageBody[selectedPagedId]),
                    first()
                );
            }),
            tap((bodyPage) => {
                this.wallModel.api[UNDO_REDO_API_NAME].clear();
                this.wallModel.api.core.setPlan(bodyPage.body);
            })
        ).subscribe();

        // body editor -> database
        this.bodyPage$.pipe(
            withLatestFrom(this.selectedPageId$)
        ).subscribe(([bodyPage, selectedPageId]) => {
            this.pageService.updatePageBody({
                id: selectedPageId,
                body: bodyPage
            });
        });

        this.newBrickPageId$.pipe(
            withLatestFrom(this.selectedPageId$),
            mergeMap(([newBrickPageId, selectedPageId]) => {
                return fromPromise(this.pageService.createPage(selectedPageId)).pipe(
                    map((newPageId) => [newBrickPageId, selectedPageId, newPageId])
                );
            }),
            mergeMap(([newBrickPageId, selectedPageId, newPageId]) => {
                return this.pageService.pageIdentity$.pipe(
                    filter((pageIdentities) => Boolean(pageIdentities[newPageId])),
                    map((pageIdentities) => pageIdentities[newPageId]),
                    tap((newPageIdentity) => {
                        const newPageBrickState: IPageBrickState = {
                            pageId: newPageIdentity.id
                        };

                        this.wallModel.api.core.updateBrickState(newBrickPageId, newPageBrickState);
                    })
                );
            })
        ).subscribe();
    }

    onHeaderEnterHandler() {
    }
}
