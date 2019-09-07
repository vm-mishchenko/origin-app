import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {Observable} from 'rxjs';
import {filter, map, shareReplay, switchMap} from 'rxjs/operators';
import {PAGE_LOCK_CONFIG_ITEM_TYPE} from '../../config/configs/page-lock-config.constant';
import {PageConfigRepositoryService} from '../../config/page-config-repository.service';
import {IPageViewStore, PageViewStore} from './page-view.store';

@Injectable()
export class PageViewQuery extends Query<IPageViewStore> {
    selectedPageId$ = this.select(pageViewStore => pageViewStore.selectedPageId).pipe(
      filter((selectedPageId) => Boolean(selectedPageId))
    );

    // receive "isLocked" page config  value
    isPageLocked$: Observable<boolean> = this.selectedPageId$.pipe(
        switchMap((selectedPageId) => {
            return this.pageConfigRepositoryService.get$(selectedPageId)
                .pipe(
                    map((pageConfig) => {
                        return pageConfig[PAGE_LOCK_CONFIG_ITEM_TYPE];
                    })
                );
        }),
        shareReplay()
    );

    constructor(protected pageViewStore: PageViewStore,
                private pageConfigRepositoryService: PageConfigRepositoryService) {
        super(pageViewStore);
    }

    getSelectedPageId(): string {
        return this.getValue().selectedPageId;
    }

    getSelectedBrickIds(): string[] {
        return this.getValue().selectedBrickIds;
    }
}
