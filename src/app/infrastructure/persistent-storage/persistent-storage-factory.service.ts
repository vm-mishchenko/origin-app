import {Injectable} from '@angular/core';
import {akitaConfig, EntityState, EntityStore, Query} from '@datorama/akita';
import {PouchdbStorageFactory} from '../pouchdb/pouchdb-storage';
import {PersistentStorage} from './persistent-storage';
import {POUCH_DB_DEBOUNCE_TIME} from './persistent-storage.constant';
import {IPersistedStorageCreateOptions, IPersistedStorageEntity, IPersistedStorageFactoryOptions} from './persistent-storage.types';

akitaConfig({
    resettable: true
});

@Injectable({
    providedIn: 'root'
})
export class PersistentStorageFactory {
    private globalFactoryOptions: IPersistedStorageFactoryOptions = {
        pouchDbSavingDebounceTime: POUCH_DB_DEBOUNCE_TIME
    };

    constructor(private pouchdbStorageFactory: PouchdbStorageFactory) {
    }

    // todo: need cached already created Storages.
    create<M extends IPersistedStorageEntity>(options: IPersistedStorageCreateOptions): PersistentStorage<M> {
        // pouch db database
        const pouchdbStorage = this.pouchdbStorageFactory.createPouchDB<M>({
            name: options.name
        });

        // merge client and default options
        options = {
            ...options,
            ...this.globalFactoryOptions
        };

        // akita memory store
        const memoryStore = new EntityStore<EntityState<M>, M>({}, {
            storeName: options.name
        });

        // akita query based on akita memory store
        const query = new Query<EntityState<M>>(memoryStore);

        return new PersistentStorage<M>(pouchdbStorage, memoryStore, query, {pouchDbSavingDebounceTime: options.pouchDbSavingDebounceTime});
    }

    // set global options for factory. Used for all operation
    // if used does not provide more specific options for each operation
    setOptions(options: IPersistedStorageFactoryOptions) {
        this.globalFactoryOptions = options;
    }
}
