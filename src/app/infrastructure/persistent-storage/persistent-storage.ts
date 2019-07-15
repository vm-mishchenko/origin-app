import {EntityState, EntityStore, HashMap, Query} from '@datorama/akita';
import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {EntityStorePouchDb} from '../pouchdb/pouchdb-storage';
import {IPersistedStorageEntity, IPersistentStorageOptions} from './persistent-storage.types';

/**
 * Facade around memory and pouchDB databases.
 * Need to think about splitting methods to two classes - read only and write only.
 * */
export class PersistentStorage<M extends IPersistedStorageEntity> {
    entities$: Observable<HashMap<M>>;

    pouchUpdateCache: any = {};

    constructor(protected pouchdbStorage: EntityStorePouchDb<M>,
                protected memoryStore: EntityStore<EntityState<M>, M>,
                protected query: Query<EntityState<M>>,
                private options: IPersistentStorageOptions) {
        this.entities$ = this.query.select((store) => store.entities);
    }

    // read
    getMemoryEntries(): HashMap<M> {
        return this.query.getValue().entities;
    }

    // todo: need to cache those requests
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

    getAll(): Promise<M[]> {
        return this.findAndLoad({
            selector: {title: {$exists: true}}
        });
    }

    findAndLoad(options: any): Promise<M[]> {
        return this.pouchdbStorage.find(options).then((entities) => {
            this.memoryStore.add(entities);

            return entities;
        });
    }

    isExist(id: string): Promise<boolean> {
        return this.get(id).then(() => true).catch(() => false);
    }

    // mutate
    addIfNotExists(record: M): Promise<any> {
        return this.isExist(record.id).then((isExists) => {
            if (!isExists) {
                return this.add(record);
            }
        });
    }

    add(record: M): Promise<any> {
        this.memoryStore.add(record);

        return this.pouchdbStorage.add(record);
    }

    update(id: string, updatedEntity: Partial<M>): Promise<Partial<M>> {
        this.memoryStore.update(id, updatedEntity);

        if (this.options.pouchDbSavingDebounceTime === 0) {
            // for test
            return this.pouchdbStorage.update(updatedEntity);
        }

        // that branch related to production code
        if (!this.pouchUpdateCache[id]) {
            this.pouchUpdateCache[id] = this.query.select((store) => store.entities[id])
                .pipe(
                    debounceTime(this.options.pouchDbSavingDebounceTime)
                ).subscribe((memoryEntity) => {
                    this.pouchUpdateCache[id].unsubscribe();
                    this.pouchUpdateCache[id] = null;

                    return this.pouchdbStorage.update(memoryEntity);
                });
        }

        return Promise.resolve(updatedEntity);
    }

    remove(id: string): Promise<any> {
        this.memoryStore.remove(id);

        return this.pouchdbStorage.remove(id);
    }

    reset() {
        // remove only memory data
        this.memoryStore.reset();
    }

    sync(): Promise<any> {
        return Promise.all(
            Object.values(this.query.getValue().entities).map((entity) => {
                return this.pouchdbStorage.get(entity.id).then((pouchDbEntity) => {
                    this.memoryStore.update(entity.id, pouchDbEntity);
                }).catch(() => {
                    this.memoryStore.remove(entity.id);
                });
            })
        );
    }

    private extractEntityFromRawEntity(rawEntity) {
        const {_id, _rev, ...entity} = rawEntity;

        return entity;
    }
}
