import {Component, Directive, EventEmitter, forwardRef, Inject, Input, OnInit, Output} from '@angular/core';
import {IInputPanelItem} from 'ngx-input-projection';
import {combineLatest, from, Observable, of} from 'rxjs';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {RandomReactiveListItem} from '../../../../../../../infrastructure/utils/random-reactive-list-item';
import {NavigationService} from '../../../../../../../modules/navigation';
import {RecentlyViewedPagesService} from '../../../../../recently-viewed/recently-viewed.service';
import {PageSearchService} from '../../../../../search/page-search.service';
import {PagePickInputComponent} from '../input/page-pick-input.component';

@Directive({
    selector: 'page-pick-list[page-pick-navigate]'
})
export class PagePickNavigateDirective {
    // todo: read more about that case
    // https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a
    constructor(@Inject(forwardRef(() => PagePickListComponent)) private pagePickListComponent: PagePickListComponent,
                private navigationService: NavigationService) {
        this.pagePickListComponent.selectedPage.subscribe((selectedPage) => {
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
    selector: 'page-pick-list',
    templateUrl: 'page-pick-list.component.html',
    styleUrls: ['./page-pick-list.component.scss']
})
export class PagePickListComponent implements OnInit {
    @Input() pagePickInput: PagePickInputComponent;
    @Output() selectedPage: EventEmitter<ISelectedPage> = new EventEmitter<ISelectedPage>();

    private searchQuery$: Observable<string>;

    recentlyViewedPages$: Observable<IInputPanelItem[]>;
    pageSearch$: Observable<IInputPanelItem[]>;

    private hasSearchResults$: Observable<boolean>;

    showEmptyText$: Observable<boolean>;

    keyStream$: Observable<KeyboardEvent>;

    emptyText$: Observable<string>;

    constructor(readonly recentlyViewedPagesService: RecentlyViewedPagesService,
                private pageSearchService: PageSearchService) {
    }

    ngOnInit() {
        this.keyStream$ = this.pagePickInput.keyStream$;
        this.searchQuery$ = this.pagePickInput.searchQuery$;

        this.recentlyViewedPages$ = combineLatest([
            this.searchQuery$.pipe(startWith('')),
            this.recentlyViewedPagesService.recentlyViewed$
        ]).pipe(
          map(([searchQuery, recentlyViewedPages]) => {
              return recentlyViewedPages.filter((recentlyViewedPage) => {
                  return recentlyViewedPage.title.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase());
              });
          })
        );

        this.pageSearch$ = this.searchQuery$.pipe(
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

        this.hasSearchResults$ = combineLatest([
            this.recentlyViewedPages$,
            this.pageSearch$,
        ]).pipe(
          map(([recentlyViewedPages, pageSearchList]) => {
              return Boolean(recentlyViewedPages.length || pageSearchList.length);
          })
        );

        this.showEmptyText$ = combineLatest([
            this.hasSearchResults$,
            this.searchQuery$
        ]).pipe(
          map(([hasSearchResults, searchQuery]) => {
              return searchQuery.length && !hasSearchResults;
          }),
          startWith(false)
        );

        const emptyTextList = new RandomReactiveListItem(EMPTY_MESSAGES);
        this.emptyText$ = emptyTextList.pipe(this.hasSearchResults$);
    }

    onValue(value: ISelectedPage) {
        this.selectedPage.emit(value);
    }
}
