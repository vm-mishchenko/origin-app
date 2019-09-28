import {Observable} from 'rxjs';
import {debounceTime, map, startWith} from 'rxjs/operators';

export class RandomReactiveListItem<T> {
    private lastReturnedItemIndex = 0;

    constructor(private list: T[]) {
    }

    pipe(triggerStream: Observable<any>) {
        return triggerStream.pipe(
          startWith(() => {
              return this.getRandomItem();
          }),
          debounceTime(500),
          map(() => {
              return this.getRandomItem();
          })
        );
    }

    getRandomItem() {
        this.lastReturnedItemIndex++;

        if (this.lastReturnedItemIndex === this.list.length) {
            this.lastReturnedItemIndex = 0;
        }


        return this.list[this.lastReturnedItemIndex];
    }
}
