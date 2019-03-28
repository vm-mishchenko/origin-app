import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {IPageViewStore, PageViewStore} from './page-view.store';

@Injectable()
export class PageViewQuery extends Query<IPageViewStore> {
    selectedPageId$ = this.select(pageViewStore => pageViewStore.selectedPageId);

    constructor(protected pageViewStore: PageViewStore) {
        super(pageViewStore);
    }

    getSelectedPageId(): string {
        return this.getValue().selectedPageId;
    }

    getSelectedBrickIds(): string[] {
        return this.getValue().selectedBrickIds;
    }
}
