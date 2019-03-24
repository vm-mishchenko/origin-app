import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {IPageViewStore, PageViewStore} from './page-view.store';

@Injectable()
export class PageViewQuery extends Query<IPageViewStore> {
    isMenuOpen$ = this.select(pageViewStore => Boolean(pageViewStore.isMenuOpen));

    constructor(protected pageViewStore: PageViewStore) {
        super(pageViewStore);
    }
}
