import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {filter, switchMap} from 'rxjs/operators';
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
  private recentlyViewedBehaviour$ = new BehaviorSubject<Array<IRecentlyViewedPage>>([]);
  recentlyViewed$ = this.recentlyViewedBehaviour$.asObservable();

  private cursorPosition = -1;

  constructor(private eventBus: EventBus,
              private navigationService: NavigationService,
              private pageRepositoryService2: PageRepositoryService2) {
    this.eventBus.events$.pipe(
      filter((event) => event instanceof PageOpened),
      filter((event) => {
        return event.pageId && event.pageId !== this.getCurrentPageId();
      }),
      switchMap((event: PageOpened) => {
        return this.pageRepositoryService2.pageIdentity(event.pageId);
      })
    ).subscribe((pageIdentitySnapshot) => {
      const sliceIndex = this.cursorPosition === -1 ? 0 : this.cursorPosition + 1;

      let newRecentlyViewed = this.recentlyViewedBehaviour$.getValue().slice(0, sliceIndex);

      newRecentlyViewed = newRecentlyViewed.concat([
        {
          id: pageIdentitySnapshot.id,
          title: pageIdentitySnapshot.data().title
        }
      ]);

      console.log(`next`);
      this.recentlyViewedBehaviour$.next(newRecentlyViewed);
      this.cursorPosition = newRecentlyViewed.length - 1;
    });
  }

  goToNextPage() {
    if (this.isCursorAtTheEnd()) {
      return false;
    }

    this.cursorPosition++;
    const nextPageId = this.recentlyViewedBehaviour$.getValue()[this.cursorPosition].id;
    this.navigationService.toPage(nextPageId);
  }

  goToPreviousPage() {
    if (this.recentlyViewedBehaviour$.getValue().length === 0 || this.isCursorAtTheStart()) {
      return;
    }

    this.cursorPosition--;
    const previousPageId = this.recentlyViewedBehaviour$.getValue()[this.cursorPosition].id;
    this.navigationService.toPage(previousPageId);
  }

  private getCurrentPageId() {
    if (this.cursorPosition === -1) {
      return undefined;
    }

    return this.recentlyViewedBehaviour$.getValue()[this.cursorPosition];
  }

  private isCursorAtTheEnd() {
    return this.cursorPosition + 1 === this.recentlyViewedBehaviour$.getValue().length;
  }

  private isCursorAtTheStart() {
    return this.cursorPosition === 0;
  }
}
