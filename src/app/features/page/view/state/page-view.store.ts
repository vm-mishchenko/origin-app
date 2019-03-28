import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';

export interface IPageViewStore {
    selectedPageId: string;
    selectedBrickIds: string[];
}

export function createInitialState(): IPageViewStore {
    return {
        selectedPageId: null,
        selectedBrickIds: []
    };
}

@Injectable()
@StoreConfig({name: 'page-view'})
export class PageViewStore extends Store<IPageViewStore> {
    constructor() {
        super(createInitialState());
    }

    setSelectedPageId(pageId: string) {
        this.update((state) => {
            return {
                ...state,
                selectedPageId: pageId
            };
        });
    }

    setSelectedBrickIds(selectedBrickIds: string[]) {
        this.update((state) => {
            return {
                ...state,
                selectedBrickIds
            };
        });
    }
}
