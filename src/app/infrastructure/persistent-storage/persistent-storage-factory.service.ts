import {Injectable} from '@angular/core';
import {EntityState, EntityStore, HashMap, Query} from '@datorama/akita';
import {Observable} from 'rxjs';
import {PouchdbStorageFactory} from '../pouchdb-storage';

export interface IPersistedStorageCreateOptions {
    name: string;
}

export interface IPersistedStorageRecord {
    id: string;
}

/* Facade around memory and pouchDB databases */
export class PersistentStorage<M extends IPersistedStorageRecord> {
    entities$: Observable<HashMap<M>>;

    constructor(private pouchdbStorage: any, private memoryStore: EntityStore<EntityState<M>, M>, private query: Query<EntityState<M>>) {
        this.entities$ = this.query.select((store) => store.entities);
    }

    add(record: M): Promise<any> {
        this.memoryStore.add(record);

        this.pouchdbStorage.put({
            _id: record.id,

            // todo: find the way to fix it
            ...(record as object)
        });

        return Promise.resolve();
    }

    load(id: string): Promise<any> {
        return this.pouchdbStorage.get(id).then((rawEntity) => {
            const entity = this.extractEntityFromRawEntity(rawEntity);

            this.memoryStore.add(entity);

            return entity;
        });
    }

    loadAll(): Promise<any> {
        return this.pouchdbStorage.allDocs({include_docs: true}).then((result) => {
            const entities = result.rows.map((rowEntity) => this.extractEntityFromRawEntity(rowEntity.doc));

            this.memoryStore.add(entities);

            return entities;
        });
    }

    remove(id: string): Promise<any> {
        this.memoryStore.remove(id);

        return this.pouchdbStorage.get(id).then((record) => this.pouchdbStorage.remove(record));
    }

    private extractEntityFromRawEntity(rawEntity) {
        const {_id, _rev, ...entity} = rawEntity;

        return entity;
    }
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
