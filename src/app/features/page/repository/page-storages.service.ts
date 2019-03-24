import {Injectable} from '@angular/core';
import {PersistentStorage, PersistentStorageFactory} from '../../../infrastructure/persistent-storage';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Injectable()
export class PageStoragesService {
    pageIdentityStorage: PersistentStorage<IIdentityPage>;
    pageBodyStorage: PersistentStorage<IBodyPage>;
    pageRelationStorage: PersistentStorage<IRelationPage>;

    constructor(private persistentStorageFactory: PersistentStorageFactory) {
        // initialize required storage
        this.pageIdentityStorage = this.persistentStorageFactory.create<IIdentityPage>({
            name: 'page-identity'
        });
        this.pageBodyStorage = this.persistentStorageFactory.create<IBodyPage>({
            name: 'page-body-editor'
        });
        this.pageRelationStorage = this.persistentStorageFactory.create<IRelationPage>({
            name: 'page-relation'
        });
    }

    reset() {
        this.pageIdentityStorage.reset();
        this.pageBodyStorage.reset();
        this.pageRelationStorage.reset();
    }
}
