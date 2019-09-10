import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';
import {EventBus} from '../../../../modules/event-bus/event-bus';
import {PageOpened} from './events';

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
    constructor(private eventBus: EventBus) {
        super(createInitialState());
    }

    setSelectedPageId(pageId: string) {
        this.update((state) => {
            return {
                ...state,
                selectedPageId: pageId
            };
        });

        this.eventBus.dispatch(new PageOpened(pageId));
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
