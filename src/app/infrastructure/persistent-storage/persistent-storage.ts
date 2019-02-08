/* Facade around memory and pouchDB databases */
import {EntityState, EntityStore, HashMap, Query} from '@datorama/akita';
import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/internal/operators';
import {IPersistedStorageEntity, IPersistentStorageOptions} from './persistent-storage.types';

export class PersistentStorage<M extends IPersistedStorageEntity> {
    entities$: Observable<HashMap<M>>;

    pouchUpdateCache: any = {};

    constructor(protected pouchdbStorage: any,
                protected memoryStore: EntityStore<EntityState<M>, M>,
                protected query: Query<EntityState<M>>,
                private options: IPersistentStorageOptions) {
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

        return this.pouchdbStorage.put({
            _id: record.id,

            // todo: find the way to fix it
            ...(record as object)
        });
    }

    update(id: string, newEntity: Partial<M>): Promise<Partial<M>> {
        if (!this.pouchUpdateCache[id]) {
            this.pouchUpdateCache[id] = this.query.select((store) => store.entities[id]).pipe(
                debounceTime(this.options.pouchDbSavingDebounceTime)
            ).subscribe((memoryEntity) => {
                this.pouchdbStorage.get(id).then((entity) => {
                    this.pouchUpdateCache[id].unsubscribe();
                    this.pouchUpdateCache[id] = null;

                    return this.pouchdbStorage.put({
                        ...entity,
                        ...(memoryEntity as object)  // todo: find the way to fix it
                    });
                });
            });
        }

        this.memoryStore.update(id, newEntity);

        return Promise.resolve(newEntity);
    }

    remove(id: string): Promise<any> {
        this.memoryStore.remove(id);

        return this.pouchdbStorage.get(id).then((entry) => this.pouchdbStorage.remove(entry));
    }

    private extractEntityFromRawEntity(rawEntity) {
        const {_id, _rev, ...entity} = rawEntity;

        return entity;
    }
}
