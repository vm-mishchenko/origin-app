import {Injectable} from '@angular/core';
import {EntityState, EntityStore, Query} from '@datorama/akita';
import {PouchdbStorageFactory} from '../pouchdb/pouchdb-storage';
import {PersistentStorage} from './persistent-storage';
import {POUCH_DB_DEBOUNCE_TIME} from './persistent-storage.constant';
import {IPersistedStorageCreateOptions, IPersistedStorageEntity, IPersistedStorageFactoryOptions} from './persistent-storage.types';

@Injectable()
export class PersistentStorageFactory {
    private globalFactoryOptions: IPersistedStorageFactoryOptions = {
        pouchDbSavingDebounceTime: POUCH_DB_DEBOUNCE_TIME
    };

    constructor(private pouchdbStorageFactory: PouchdbStorageFactory) {
    }

    create<M extends IPersistedStorageEntity>(options: IPersistedStorageCreateOptions): PersistentStorage<M> {
        const pouchdbStorage = this.pouchdbStorageFactory.createPouchDB({
            name: options.name
        });

        // combine user and default options
        options = {
            ...options,
            ...this.globalFactoryOptions,
        };

        const memoryStore = new EntityStore<EntityState<M>, M>({}, {
            storeName: options.name
        });

        const query = new Query<EntityState<M>>(memoryStore);

        return new PersistentStorage<M>(pouchdbStorage, memoryStore, query, {pouchDbSavingDebounceTime: options.pouchDbSavingDebounceTime});
    }

    // set global options for factory. Used for all operation
    // if used does not provide more specific options for each operation
    setOptions(options: IPersistedStorageFactoryOptions) {
        this.globalFactoryOptions = options;
    }
}
