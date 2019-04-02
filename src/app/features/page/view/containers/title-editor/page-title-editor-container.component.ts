import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import {PageRepositoryService, PageService} from '../../../repository';
import {HeaderControlComponent} from '../../../../../components/form-controls/header-control/header-control.component';

@Component({
    selector: 'app-title-page-editor-container',
    templateUrl: './page-title-editor-container.component.html',
    styleUrls: ['./page-title-editor-container.component.scss']
})
export class PageTitleEditorContainerComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild(HeaderControlComponent) headerControlComponent: HeaderControlComponent;
    @Input() selectedPageId: string;
    @Output() enter: EventEmitter<any> = new EventEmitter();

    selectedPageId$: Observable<string> = new BehaviorSubject<string>('');
    selectedPageIdentityTitle$: Observable<string>;
    pageForm: FormGroup;

    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                private pageService: PageService,
                private pageRepositoryService: PageRepositoryService) {
        this.pageForm = this.formBuilder.group({
            title: this.formBuilder.control('')
        });

        this.selectedPageIdentityTitle$ = this.selectedPageId$.pipe(
            switchMap((selectedPagedId) => {
                return this.pageRepositoryService.pageIdentity$.pipe(
                    filter((pageIdentity) => Boolean(pageIdentity[selectedPagedId])),
                    map((pageIdentity) => pageIdentity[selectedPagedId].title)
                );
            }),
            shareReplay()
        );
    }

    ngOnInit() {
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

                // focus on title
                setTimeout(() => {
                    this.headerControlComponent.focus();
                }, 300);
            })
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selectedPageId && changes.selectedPageId.currentValue) {
            (this.selectedPageId$ as BehaviorSubject<string>).next(changes.selectedPageId.currentValue);
        }
    }

    onHeaderEnterHandler() {
        this.enter.emit();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
