import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {IPageConfigData, IPageConfigItems, PageConfigStorageService} from './page-config-storage.service';
import {PAGE_CONFIG_COLLECTION_NAME} from './page-config.constant';

/**
 * Read-only page config storage.
 */
@Injectable({
    providedIn: 'root'
})
export class PageConfigRepositoryService {
  private pageConfigs = this.databaseManager.collection<IPageConfigData>(PAGE_CONFIG_COLLECTION_NAME);

    constructor(private pageConfigStorageService: PageConfigStorageService,
                @Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
    }

    /**
     * Load into the memory Page Config by id.
     */
    load(pageId: string): Promise<any> {
      const pageConfigDocRef = this.pageConfigs.doc(pageId);

      // the tricky part that Page Config might not exists, because Page could be already created before.
      return pageConfigDocRef.snapshot()
        .then((configSnapshot) => {
          // Page exists, we could safely try to create Page Config if it does not exists
          // or load already existing config
          if (!configSnapshot.exists) {
            return pageConfigDocRef.set({
              configs: {}
            });
          }
        }).then(() => pageConfigDocRef.sync());
    }

    get$(id: string): Observable<IPageConfigItems> {
      return this.pageConfigs.doc(id)
        .onSnapshot().pipe(
          filter((pageConfigSnapshot: any) => {
            return pageConfigSnapshot.exists;
          }),
          map((pageConfigSnapshot: any) => {
            return pageConfigSnapshot.data().configs;
          })
        );
    }
}
