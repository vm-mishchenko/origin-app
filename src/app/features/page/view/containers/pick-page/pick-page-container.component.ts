import {Component, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {combineLatest, from, Observable, of, Subject} from 'rxjs';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {RandomReactiveListItem} from '../../../../../infrastructure/utils/random-reactive-list-item';
import {NavigationService} from '../../../../../modules/navigation';
import {RecentlyViewedPagesService} from '../../../recently-viewed/recently-viewed.service';
import {PageSearchService} from '../../../search/page-search.service';

@Directive({
    selector: 'pick-page-container[page-navigate]'
})
export class PageNavigateDirective {
    // todo: read more about that case
    // https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a
    constructor(@Inject(forwardRef(() => PickPageContainerComponent)) private pickPageContainerComponent: PickPageContainerComponent,
                private navigationService: NavigationService) {
        this.pickPageContainerComponent.selectedPage.subscribe((selectedPage) => {
            this.navigationService.toPage(selectedPage.id);
        });
    }
}

export interface ISelectedPage {
    id: string;
    title: string;
}

const EMPTY_MESSAGES = [
    'Nothing here',
    'I remember, it definitely has that name!',
    'Hm, seems empty',
    'No results',
    ':( I agree, remember page name is not always easy',
    'Good try, keep going'
];

@Component({
    selector: 'pick-page-container',
    templateUrl: 'pick-page-container.component.html',
    styleUrls: ['./pick-page-container.component.scss']
})
export class PickPageContainerComponent implements OnInit {
    @ViewChild('input') input: ElementRef;
    @Input() placeholder = 'Find your pages';
    @Output() selectedPage: EventEmitter<ISelectedPage> = new EventEmitter<ISelectedPage>();

    searchForm = this.formBuilder.group({
        search: this.formBuilder.control('')
    });

    searchQuery$ = this.searchForm.get('search').valueChanges;

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

    pageSearch$ = this.searchQuery$.pipe(
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

    private hasSearchResults$ = combineLatest([
        this.recentlyViewedPages$,
        this.pageSearch$,
    ]).pipe(
      map(([recentlyViewedPages, pageSearchList]) => {
          return Boolean(recentlyViewedPages.length || pageSearchList.length);
      })
    );

    showEmptyText$ = combineLatest([
        this.hasSearchResults$,
        this.searchQuery$
    ]).pipe(
      map(([hasSearchResults, searchQuery]) => {
          return searchQuery.length && !hasSearchResults;
      }),
      startWith(false)
    );

    keyStream$ = new Subject();

    emptyText$: Observable<string>;

    constructor(readonly recentlyViewedPagesService: RecentlyViewedPagesService,
                private pageSearchService: PageSearchService,
                private formBuilder: FormBuilder) {
        const emptyTextList = new RandomReactiveListItem(EMPTY_MESSAGES);
        this.emptyText$ = emptyTextList.pipe(this.hasSearchResults$);
    }

    ngOnInit() {
        this.input.nativeElement.focus();
    }

    onKeydown(event: KeyboardEvent) {
        this.keyStream$.next(event);
    }

    onValue(value: ISelectedPage) {
        this.selectedPage.emit(value);
    }
}
