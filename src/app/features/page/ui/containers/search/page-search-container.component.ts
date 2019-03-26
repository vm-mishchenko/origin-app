import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {IPageSearchItem, PageSearchService} from '../../../search/page-search.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {debounceTime, switchMap} from 'rxjs/operators';

@Component({
    selector: 'app-page-search-container',
    templateUrl: './page-search-container.component.html',
    styleUrls: ['./page-search-container.component.scss']
})
export class PageSearchContainerComponent implements OnInit {
    @Output() selectItem: EventEmitter<IPageSearchItem> = new EventEmitter();
    pageSearchItems$: Observable<IPageSearchItem[]>;
    pageForm: FormGroup;

    constructor(private pageSearchService: PageSearchService,
                private formBuilder: FormBuilder) {
    }

    ngOnInit() {
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
    }

    selectSearchItem(pageSearchItem: IPageSearchItem) {
        this.selectItem.emit(pageSearchItem);
    }
}
