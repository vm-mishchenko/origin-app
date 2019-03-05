import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';

export interface IPageViewStore {
    isMenuOpen: boolean;
}

export function createInitialState(): IPageViewStore {
    return {
        isMenuOpen: true
    };
}

@Injectable()
@StoreConfig({name: 'page-view'})
export class PageViewStore extends Store<IPageViewStore> {
    constructor() {
        super(createInitialState());
    }

    toggleMenu() {
        this.update((state) => {
            return {
                ...state,
                isMenuOpen: !state.isMenuOpen
            };
        });
    }

    closeMenu() {
        this.update((state) => {
            return {
                ...state,
                isMenuOpen: false
            };
        });
    }

    openMenu() {
        this.update((state) => {
            return {
                ...state,
                isMenuOpen: true
            };
        });
    }
}
