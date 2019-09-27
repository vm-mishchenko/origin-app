import {Component, Directive, ElementRef, EventEmitter, forwardRef, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {combineLatest, from, of, Subject} from 'rxjs';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';
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

@Component({
    selector: 'pick-page-container',
    templateUrl: 'pick-page-container.component.html',
    styleUrls: ['./pick-page-container.component.scss']
})
export class PickPageContainerComponent implements OnInit {
    @ViewChild('input') input: ElementRef;
    @Output() selectedPage: EventEmitter<ISelectedPage> = new EventEmitter<ISelectedPage>();

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

    onValue(value: ISelectedPage) {
        this.selectedPage.emit(value);
    }
}
