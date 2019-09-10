import {Injectable} from '@angular/core';
import {filter} from 'rxjs/internal/operators';
import {EventBus} from '../../../modules/event-bus/event-bus';
import {NavigationService} from '../../../modules/navigation';
import {PageOpened} from '../view/state/events';

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedPagesService {
  cursorPosition = -1;
  pageNavigationHistory: string[] = [];

  constructor(private eventBus: EventBus,
              private navigationService: NavigationService) {
    this.eventBus.events$.pipe(
      filter((event) => event instanceof PageOpened)
    ).subscribe((event: PageOpened) => {
      if (event.pageId && event.pageId !== this.getCurrentPageId()) {
        const sliceIndex = this.cursorPosition === -1 ? 0 : this.cursorPosition + 1;

        this.pageNavigationHistory = this.pageNavigationHistory.slice(0, sliceIndex);
        this.pageNavigationHistory.push(event.pageId);
        this.cursorPosition = this.pageNavigationHistory.length - 1;
      }
    });
  }

  goToNextPage() {
    if (this.isCursorAtTheEnd()) {
      return false;
    }

    this.cursorPosition++;
    const nextPageId = this.pageNavigationHistory[this.cursorPosition];
    this.navigationService.toPage(nextPageId);
  }

  goToPreviousPage() {
    if (this.pageNavigationHistory.length === 0 || this.isCursorAtTheStart()) {
      return;
    }

    this.cursorPosition--;
    const previousPageId = this.pageNavigationHistory[this.cursorPosition];
    this.navigationService.toPage(previousPageId);
  }

  private getCurrentPageId() {
    if (this.cursorPosition === -1) {
      return undefined;
    }

    return this.pageNavigationHistory[this.cursorPosition];
  }

  private isCursorAtTheEnd() {
    return this.cursorPosition + 1 === this.pageNavigationHistory.length;
  }

  private isCursorAtTheStart() {
    return this.cursorPosition === 0;
  }
}
