import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {IPageSearchItem, PageSearchService} from '../../../search/page-search.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';

@Component({
    selector: 'app-page-search-container',
    templateUrl: './page-search-container.component.html',
    styleUrls: ['./page-search-container.component.scss']
})
export class PageSearchContainerComponent implements OnInit {
    @ViewChild('input') input: ElementRef;

    @Output() selectItem: EventEmitter<IPageSearchItem> = new EventEmitter();
    pageSearchItems$: Observable<IPageSearchItem[]>;
    emptyTextIndex = 0;
    emptyTextVariants: string[] = [
        'Nothing here',
        'I remember, it definitely has that name!',
        'Hm, seems empty',
        'No results',
        ':( I agree, remember page name is not always easy',
        'Good try, keep going'
    ];
    emptyText$: Observable<string>;
    pageForm: FormGroup;

    constructor(private pageSearchService: PageSearchService,
                private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.input.nativeElement.focus();

        this.pageForm = this.formBuilder.group({
            query: this.formBuilder.control('')
        });

        this.pageSearchItems$ = this.pageForm.get('query').valueChanges.pipe(
            debounceTime(100),
            switchMap((query) => {
                if (query === '') {
                    return of([]);
                }

                return this.pageSearchService.search(query);
            })
        );

        this.emptyText$ = this.pageSearchItems$.pipe(
            startWith(this.getNextEmptyText()),
            debounceTime(500),
            map(() => {
                return this.getNextEmptyText();
            })
        );
    }

    selectSearchItem(pageSearchItem: IPageSearchItem) {
        this.selectItem.emit(pageSearchItem);
    }

    private getNextEmptyText() {
        this.emptyTextIndex++;

        if (this.emptyTextIndex === this.emptyTextVariants.length) {
            this.emptyTextIndex = 0;
        }


        return this.emptyTextVariants[this.emptyTextIndex];
    }
}
