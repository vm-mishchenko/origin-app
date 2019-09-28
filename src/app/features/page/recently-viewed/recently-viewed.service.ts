import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {filter, switchMap} from 'rxjs/operators';
import {EventBus} from '../../../modules/event-bus/event-bus';
import {NavigationService} from '../../../modules/navigation';
import {PageRepositoryService2} from '../repository/page-repository.service2';
import {PageOpened} from '../view/state/events';

class UniqueList<T extends { id: string }> {
  private listBehaviour$ = new BehaviorSubject<Array<T>>([]);
  list$ = this.listBehaviour$.asObservable();

  constructor(private maxListNumber: number = 20) {
  }

  add(item: T) {
    const newList: T[] = this.deleteItemIfExist(item);

    if (newList.length < this.maxListNumber) {
      newList.push(item);
    }

    this.listBehaviour$.next(newList);
  }

  private deleteItemIfExist(item: T) {
    const currentList = this.listBehaviour$.getValue();

    const existingItemIndex = currentList.findIndex((currentItem) => {
      return currentItem.id === item.id;
    });

    let newList: T[];

    if (existingItemIndex !== -1) {
      newList = [
        ...currentList.slice(0, existingItemIndex),
        ...currentList.slice(existingItemIndex + 1)
      ];
    } else {
      newList = currentList.slice(0);
    }

    return newList;
  }
}

export interface IRecentlyViewedPage {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedPagesService {
  private recentlyViewedPages = new UniqueList<IRecentlyViewedPage>();
  recentlyViewed$ = this.recentlyViewedPages.list$;

  constructor(private eventBus: EventBus,
              private navigationService: NavigationService,
              private pageRepositoryService2: PageRepositoryService2) {
    this.eventBus.events$.pipe(
      filter((event) => event instanceof PageOpened),
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
