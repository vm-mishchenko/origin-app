import {Injectable} from '@angular/core';
import {EntityState, EntityStore, Query} from '@datorama/akita';
import {PouchdbStorageFactory} from '../pouchdb-storage';
import {PersistentStorage} from './persistent-storage';

export interface IPersistedStorageCreateOptions {
    name: string;
}

export interface IPersistedStorageRecord {
    id: string;
}

@Injectable()
export class PersistentStorageFactory {
    constructor(private pouchdbStorageFactory: PouchdbStorageFactory) {
    }

    create<M extends IPersistedStorageRecord>(options: IPersistedStorageCreateOptions): PersistentStorage<M> {
        const pouchdbStorage = this.pouchdbStorageFactory.createPouchDB({
            name: options.name
        });

        const memoryStore = new EntityStore<EntityState<M>, M>({}, {
            storeName: options.name
        });

        const query = new Query<EntityState<M>>(memoryStore);

        return new PersistentStorage<M>(pouchdbStorage, memoryStore, query);
    }
}
