import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Observable} from 'rxjs/internal/Observable';

/**
 * Provides common for all modules bus for event dispatching and listening
 */
@Injectable({
  providedIn: 'root'
})
export class EventBus {
  events$: Observable<any> = new Subject();

  constructor() {
  }

  dispatch(event) {
    (this.events$ as Subject<any>).next(event);
  }
}
