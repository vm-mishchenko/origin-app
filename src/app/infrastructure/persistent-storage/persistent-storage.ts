/* Facade around memory and pouchDB databases */
import {EntityState, EntityStore, HashMap, Query} from '@datorama/akita';
import {Observable} from 'rxjs';
import {IPersistedStorageRecord} from './persistent-storage-factory.service';

export class PersistentStorage<M extends IPersistedStorageRecord> {
    entities$: Observable<HashMap<M>>;

    constructor(protected pouchdbStorage: any,
                protected memoryStore: EntityStore<EntityState<M>, M>,
                protected query: Query<EntityState<M>>) {
        this.entities$ = this.query.select((store) => store.entities);
    }

    // read
    getMemoryEntries(): HashMap<M> {
        return this.query.getValue().entities;
    }

    load(id: string): Promise<M> {
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

    get(id: string): Promise<M> {
        if (this.query.getValue().entities[id]) {
            return Promise.resolve(this.query.getValue().entities[id]);
        } else {
            return this.load(id);
        }
    }

    findAndLoad(options: any): Promise<M[]> {
        return this.pouchdbStorage.find(options).then((result) => {
            const entities = result.docs.map((rowEntity) => this.extractEntityFromRawEntity(rowEntity));

            this.memoryStore.add(entities);

            return entities;
        });
    }

    // mutate
    add(record: M): Promise<any> {
        this.memoryStore.add(record);

        this.pouchdbStorage.put({
            _id: record.id,

            // todo: find the way to fix it
            ...(record as object)
        });

        return Promise.resolve();
    }

    update(id: string, newEntity: any): Promise<any> {
        return this.pouchdbStorage.get(id).then((rawEntity) => {
            return this.pouchdbStorage.put({
                ...rawEntity,
                ...newEntity
            }).then(() => {
                this.memoryStore.update(id, newEntity);
            });
        });
    }

    remove(id: string): Promise<any> {
        this.memoryStore.remove(id);

        return this.pouchdbStorage.get(id).then((entry) => this.pouchdbStorage.remove(entry));
    }

    removeAll(): Promise<any> {
        this.memoryStore.remove(() => true);

        return this.pouchdbStorage.allDocs().then((result) => {
            return Promise.all(result.rows.map((row) => {
                return this.pouchdbStorage.remove(row.id, row.value.rev);
            }));
        });
    }

    private extractEntityFromRawEntity(rawEntity) {
        const {_id, _rev, ...entity} = rawEntity;

        return entity;
    }
}
