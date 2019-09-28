import {Injectable} from '@angular/core';
import {filter, switchMap} from 'rxjs/operators';
import {UniqueSortedList} from '../../../infrastructure/utils/unique-sorted-list';
import {EventBus} from '../../../modules/event-bus/event-bus';
import {NavigationService} from '../../../modules/navigation';
import {PageRepositoryService2} from '../repository/page-repository.service2';
import {PageOpened} from '../view/state/events';

export interface IRecentlyViewedPage {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedPagesService {
  private recentlyViewedPages = new UniqueSortedList<IRecentlyViewedPage>();
  recentlyViewed$ = this.recentlyViewedPages.list$;

  constructor(private eventBus: EventBus,
              private navigationService: NavigationService,
              private pageRepositoryService2: PageRepositoryService2) {
    this.eventBus.events$.pipe(
      filter((event) => event instanceof PageOpened),
      filter((event) => Boolean(event.pageId)),
      switchMap((event: PageOpened) => {
        return this.pageRepositoryService2.pageIdentity(event.pageId);
      })
    ).subscribe((pageIdentitySnapshot) => {
      this.recentlyViewedPages.add({
        id: pageIdentitySnapshot.id,
        title: pageIdentitySnapshot.data().title
      });
    });
  }
}
