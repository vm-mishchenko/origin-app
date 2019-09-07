import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {PersistentStorageFactory} from '../../../infrastructure/persistent-storage';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {IPageConfigItems, PageConfigStorageService} from './page-config-storage.service';

/**
 * Read-only page config storage.
 */
@Injectable({
    providedIn: 'root'
})
export class PageConfigRepositoryService {
    constructor(private pageConfigStorageService: PageConfigStorageService,
                private persistentStorageFactory: PersistentStorageFactory,
                @Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
    }

    /**
     * Load into the memory Page Config by id.
     */
    load(pageId: string): Promise<any> {
      const pageConfigDocRef = this.databaseManager.collection('page-config').doc(pageId);

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
      return this.databaseManager.collection('page-config').doc(id)
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
