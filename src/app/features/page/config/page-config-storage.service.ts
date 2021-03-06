import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {DATABASE_MANAGER} from '../../../modules/storage/storage.module';
import {PAGE_LOCK_CONFIG_ITEM_TYPE, PageLockConfigChange} from './configs/page-lock-config.constant';
import {PageConfigRepositoryService} from './page-config-repository.service';
import {PAGE_CONFIG_COLLECTION_NAME} from './page-config.constant';
import {PageConfig} from './page.config.class';

export interface IPageConfigData {
    id: string;

    // todo: rename to items
    configs: IPageConfigItems;
}

export interface IPageConfigItems {
    [name: string]: any;
}

/**
 * Update and load page configs.
 */
@Injectable({
    providedIn: 'root'
})
export class PageConfigStorageService {
  constructor(@Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager,
              private pageConfigRepositoryService: PageConfigRepositoryService) {
    }

    changeConfig(change: PageLockConfigChange): Promise<any> {
        // retrieve page config data
        // instantiate page config instance
        // call changes
        // save page config data
      const pageConfigDocRef = this.databaseManager.collection<IPageConfigData>(PAGE_CONFIG_COLLECTION_NAME).doc(change.pageId);

      return pageConfigDocRef.snapshot()
        .then((configSnapshot) => {
          if (!configSnapshot.exists) {
            return pageConfigDocRef.set({
              configs: {}
            });
          }
        })
        .then(() => pageConfigDocRef.snapshot())
        .then((configSnapshot) => {
          const pageConfig = new PageConfig(configSnapshot.data());

          // run update logic
          return pageConfig.update(change).then(() => {
            // save updated page config
            return pageConfigDocRef.update(pageConfig.asJSON());
          });
        });
    }

  lockPage(pageId: string) {
    const changeEvent = new PageLockConfigChange(pageId, true);
    return this.changeConfig(changeEvent);
  }

  unlockPage(pageId: string) {
    const changeEvent = new PageLockConfigChange(pageId, false);
    return this.changeConfig(changeEvent);
  }

  switchLockPage(pageId: string) {
    return this.pageConfigRepositoryService.getPageConfig(pageId).then((pageConfigSnapshot) => {
      const isPageLocked = pageConfigSnapshot.data().configs[PAGE_LOCK_CONFIG_ITEM_TYPE];

      if (isPageLocked) {
        return this.unlockPage(pageId);
      } else {
        return this.lockPage(pageId);
      }
    });
  }
}
