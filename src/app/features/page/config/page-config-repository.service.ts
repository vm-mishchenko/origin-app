import {Inject, Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {DatabaseManager} from 'cinatabase';
import {Observable} from 'rxjs/internal/Observable';
import {filter, map} from 'rxjs/operators';
import {PersistentStorage, PersistentStorageFactory} from '../../../infrastructure/persistent-storage';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {PageRepositoryService} from '../repository';
import {IPageConfigData, IPageConfigItems, PageConfigStorageService} from './page-config-storage.service';

/**
 * Read-only page config storage.
 */
@Injectable({
    providedIn: 'root'
})
export class PageConfigRepositoryService {
    private pageConfigStorage: PersistentStorage<IPageConfigData> = this.persistentStorageFactory.create<IPageConfigData>({
        name: 'page-config'
    });

    pageConfigs$: Observable<HashMap<IPageConfigData>> = this.pageConfigStorage.entities$;

    constructor(private pageConfigStorageService: PageConfigStorageService,
                private persistentStorageFactory: PersistentStorageFactory,
                private pageRepositoryService: PageRepositoryService,
                @Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
        const pageId = '05500cc5-7cb4-0e81-9e51-00cefaa46773';

      this.databaseManager.collection('test-collection')
        .doc('third')
        .update(
          {foo: 'forr'}
        )
        .then(() => {
          console.log(`update succefully`);
        });

      /*this.databaseManager.collection('test-collection').doc('first').set({foo: 'forr'}).then(() => {
        console.log(`set succefully`);
      });*/
    }

    /**
     * Load into the memory Page Config by id.
     * @param id Page id.
     */
    load(id: string): Promise<any> {
        // the tricky part that Page Config might not exists, because Page could be already created before.
        return this.pageRepositoryService.getIdentityPage(id).then(() => {
            // Page exists, we could safely try to create Page Config if it does not exists
            // or load already existing config
            return this.pageConfigStorage.addIfNotExists({
                id,
                configs: {}
            }).then(() => this.pageConfigStorage.load(id));
        });
    }

    get$(id: string): Observable<IPageConfigItems> {
        return this.pageConfigs$.pipe(
            filter((pageConfigs) => Boolean(pageConfigs[id])),
            map((pageConfigs) => pageConfigs[id].configs)
        );
    }

    get(id: string): Promise<IPageConfigItems> {
        return this.pageConfigStorage.get(id).then((pageConfig) => pageConfig.configs);
    }
}

