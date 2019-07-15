import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {Observable} from 'rxjs/internal/Observable';
import {PersistentStorage, PersistentStorageFactory} from '../../../infrastructure/persistent-storage';
import {PageRepositoryService} from '../repository';
import {IPageConfigData, PageConfigStorageService} from './page-config-storage.service';


/**
 * Read-only page config storage.
 */
@Injectable({
    providedIn: 'root'
})
export class PageConfigRepositoryService {
    pageConfigs$: Observable<HashMap<IPageConfigData>> = this.pageConfigStorageService.pageConfigStorage.entities$;

    private pageConfigStorage: PersistentStorage<IPageConfigData> = this.persistentStorageFactory.create<IPageConfigData>({
        name: 'page-config'
    });

    constructor(private pageConfigStorageService: PageConfigStorageService,
                private persistentStorageFactory: PersistentStorageFactory,
                private pageRepositoryService: PageRepositoryService) {
    }

    /**
     * Load into the memory Page Config by id.
     * @param id Page id.
     */
    load(id: string): Promise<any> {
        console.log(`load`);
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
}
