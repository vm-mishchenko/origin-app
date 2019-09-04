import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {PageLockConfigChange} from './configs/page-lock-config.constant';
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
  constructor(@Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
    }

    changeConfig(change: PageLockConfigChange): Promise<any> {
        // retrieve page config data
        // instantiate page config instance
        // call changes
        // save page config data
      const pageConfigDocRef = this.databaseManager.collection('page-config').doc(change.pageId);

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
}
