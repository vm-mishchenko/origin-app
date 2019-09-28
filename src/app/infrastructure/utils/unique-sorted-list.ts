import {BehaviorSubject} from 'rxjs';

export class UniqueSortedList<T extends { id: string }> {
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
