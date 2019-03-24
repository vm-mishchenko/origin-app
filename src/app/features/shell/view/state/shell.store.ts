import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';

export interface IShellStore {
    isMenuOpen: boolean;
}

export function createInitialState(): IShellStore {
    return {
        isMenuOpen: true
    };
}

@Injectable()
@StoreConfig({name: 'shell'})
export class ShellStore extends Store<IShellStore> {
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
