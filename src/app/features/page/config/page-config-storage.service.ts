import {Injectable} from '@angular/core';
import {PersistentStorage, PersistentStorageFactory} from '../../../infrastructure/persistent-storage';
import {PageRepositoryService} from '../repository';
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
    private pageConfigStorage: PersistentStorage<IPageConfigData> = this.persistentStorageFactory.create<IPageConfigData>({
        name: 'page-config'
    });

    constructor(private persistentStorageFactory: PersistentStorageFactory,
                private pageRepositoryService: PageRepositoryService) {
    }

    changeConfig(change: PageLockConfigChange): Promise<any> {
        // retrieve page config data
        // instantiate page config instance
        // call changes
        // save page config data
        return this.pageRepositoryService.getIdentityPage(change.pageId).then(() => {
            return this.pageConfigStorage
                .addIfNotExists({
                    id: change.pageId,
                    configs: {}
                })
                .then(() => this.pageConfigStorage.get(change.pageId))
                .then((config) => {
                    const pageConfig = new PageConfig(config);

                    // run update logic
                    return pageConfig.update(change).then(() => {
                        // save updated page config
                        return this.pageConfigStorage.update(change.pageId, pageConfig.asJSON());
                    });
                });
        });
    }
}