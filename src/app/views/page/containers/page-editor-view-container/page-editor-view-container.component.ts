import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, withLatestFrom} from 'rxjs/operators';
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

    constructor(private route: ActivatedRoute,
                private router: Router,
                private pageService: PageService,
                private formBuilder: FormBuilder) {
        this.pageForm = this.formBuilder.group({
            title: this.formBuilder.control('')
        });
    }

    ngOnInit() {
        this.selectedPageId$ = this.route.params.pipe(
            map((params) => params.id)
        );

        this.selectedPageId$.subscribe((pageId) => {
            Promise.all([
                this.pageService.loadIdentityPage(pageId),
                this.pageService.loadBodyPage(pageId)
            ]).catch((e) => {
                // move to special App level module
                this.router.navigate(['/page']);
            });
        });

        // todo: consider move it to page service
        // extracting entity by id
        this.selectedPageIdentity$ = combineLatest(this.pageService.pageIdentity$, this.selectedPageId$).pipe(
            filter(([pageIdentities, selectedPageId]) => Boolean(pageIdentities[selectedPageId])),
            map(([pageIdentities, selectedPageId]) => pageIdentities[selectedPageId])
        );

        this.selectedPageBody$ = combineLatest(this.pageService.pageBody$, this.selectedPageId$).pipe(
            filter(([pageBodies, selectedPageId]) => Boolean(pageBodies[selectedPageId])),
            map(([pageBodies, selectedPageId]) => pageBodies[selectedPageId])
        );

        // todo: clean up subscription
        this.selectedPageIdentity$.pipe(
            filter((selectedPageIdentity) => selectedPageIdentity.title !== this.pageForm.get('title').value)
        ).subscribe((selectedPageIdentity) => {
            console.log(`update page form`);

            this.pageForm.patchValue({
                title: selectedPageIdentity.title
            });
        });

        // clean up subscription
        this.pageForm.valueChanges.pipe(
            withLatestFrom(this.selectedPageIdentity$),
            filter(([formValues, selectedPageIdentity]) => selectedPageIdentity.title !== formValues.title)
        ).subscribe(([formValues, selectedPageIdentity]) => {
            this.pageService.updatePageIdentity({
                id: selectedPageIdentity.id,
                title: formValues.title
            }).then(() => {
                console.log(`Page Identity was updated`);
            });
        });
    }

    onHeaderEnterHandler() {
        console.log(`click was pressed`);
    }
}
