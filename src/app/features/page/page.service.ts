import {Injectable} from '@angular/core';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import {PageIdentityMemoryStore} from './page-identity-memory-store.service';
import {PageIdentitiesQuery} from './page-identity-query.service';
import {PagePersistentStorage} from './page-persistent-storage.service';
import {PageStoreSyncStrategy} from './page-store-sync-strategy';
import {StoreFactory} from './store.factory';

@Injectable()
export class PageService {
    pageStoreSyncStrategy: PageStoreSyncStrategy;

    constructor(private pagePersistentStorage: PagePersistentStorage,
                private pageIdentitiesQuery: PageIdentitiesQuery,
                private storeFactory: StoreFactory) {
        this.pageIdentitiesQuery.select((store) => {
            return store;
        }).subscribe((store) => {
            console.log(`new store: `, store);
        });

        const persistentDb = new PouchDB('page-identity');
        const memoryDb = new PageIdentityMemoryStore();

        this.pageStoreSyncStrategy = new PageStoreSyncStrategy(persistentDb, memoryDb);
    }

    createPage(): Promise<any> {
        console.log(`create page`);

        return this.pageStoreSyncStrategy.create({
            _id: String(Date.now()),
            title: 'Default title'
        });
    }
}
