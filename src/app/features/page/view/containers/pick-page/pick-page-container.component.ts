import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {combineLatest, from, of, Subject} from 'rxjs';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {RecentlyViewedPagesService} from '../../../recently-viewed/recently-viewed.service';
import {PageSearchService} from '../../../search/page-search.service';

@Component({
    selector: 'pick-page-container',
    templateUrl: 'pick-page-container.component.html',
    styles: [`
        ::ng-deep .active {
            background-color: #ececec;
        }
    `],
})
export class PickPageContainerComponent implements OnInit {
    @ViewChild('input') input: ElementRef;

    searchForm = this.formBuilder.group({
        search: this.formBuilder.control('')
    });

    recentlyViewedPages$ = combineLatest([
        this.searchForm.get('search').valueChanges.pipe(startWith('')),
        this.recentlyViewedPagesService.recentlyViewed$
    ]).pipe(
      map(([searchQuery, recentlyViewedPages]) => {
          return recentlyViewedPages.filter((recentlyViewedPage) => {
              return recentlyViewedPage.title.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase());
          });
      })
    );

    pageSearch$ = this.searchForm.get('search').valueChanges.pipe(
      debounceTime(100),
      switchMap((searchQuery) => {
            if (searchQuery === '') {
                return of([]);
            }

            return from(this.pageSearchService.search(searchQuery)).pipe(
              map((pageSearchItems) => {
                  return pageSearchItems.map((pageSearchItem) => {
                      return {
                          id: pageSearchItem.pageId,
                          title: pageSearchItem.pageTitle
                      };
                  });
              })
            );
        }
      )
    );

    keyStream$ = new Subject();

    constructor(readonly recentlyViewedPagesService: RecentlyViewedPagesService,
                private pageSearchService: PageSearchService,
                private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.input.nativeElement.focus();
    }

    onKeydown(event: KeyboardEvent) {
        this.keyStream$.next(event);
    }

    onValue(value) {
        console.log(value);
    }
}
