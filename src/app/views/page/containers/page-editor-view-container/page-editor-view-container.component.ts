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
    UNDO_REDO_API_NAME,
    UndoRedoPlugin,
    WallModelFactory
} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {filter, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import {NavigationService} from '../../../../features/navigation';
import {PageService} from '../../../../features/page/page.service';
import {IBodyPage, IIdentityPage} from '../../../../features/page/page.types';

@Component({
    selector: 'app-page-editor-view-container',
    templateUrl: './page-editor-view-container.component.html',
    styleUrls: ['./page-editor-view-container.component.scss']
})
export class PageEditorViewContainerComponent implements OnInit {
    selectedPageId$: Observable<string>;
    selectedPageIdentity$: Observable<IIdentityPage>;
    selectedPageBody$: Observable<IBodyPage>;

    // ui
    pageForm: FormGroup;
    wallModel: IWallModel;
    bodyPage$: Observable<IWallDefinition> = new Subject<IWallDefinition>();

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

        this.wallModel.api.core.addBrickAtStart('text', {text: 'foo'});
    }

    ngOnInit() {
        this.selectedPageId$ = this.route.params.pipe(
            map((params) => params.id),
            shareReplay()
        );

        // todo: clean up subscription
        this.selectedPageId$.subscribe((pageId) => {
            Promise.all([
                this.pageService.loadIdentityPage(pageId),
                this.pageService.loadBodyPage(pageId)
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

        // todo: consider move it to page service
        // extracting entity by id
        this.selectedPageBody$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageService.pageBody$.pipe(
                    filter((pageBody) => Boolean(pageBody[selectedPagedId])),
                    map((pageBody) => pageBody[selectedPagedId])
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
            if (!(event instanceof SetPlanEvent) && !(event instanceof BeforeChangeEvent)) {
                (this.bodyPage$ as Subject<IWallDefinition>).next(this.wallModel.api.core.getPlan());
            }
        });

        this.selectedPageBody$.subscribe((bodyPage) => {
            this.wallModel.api[UNDO_REDO_API_NAME].clear();
            this.wallModel.api.core.setPlan(bodyPage.body);
        });

        this.bodyPage$.pipe(
            withLatestFrom(this.selectedPageId$)
        ).subscribe(([bodyPage, selectedPageId]) => {
            this.pageService.updatePageBody({
                id: selectedPageId,
                body: bodyPage
            });
        });
    }

    onHeaderEnterHandler() {
    }
}
