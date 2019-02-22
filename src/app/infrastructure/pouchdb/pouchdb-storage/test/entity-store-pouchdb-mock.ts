import {IEntityStorePouchDb, IPouchdbStorageEntity} from '../pouchdb-storage.types';

export class EntityStorePouchDbMock<M extends IPouchdbStorageEntity> implements IEntityStorePouchDb<M> {
    get(id) {
        return Promise.resolve();
    }

    find(options) {
        return Promise.resolve([]);
    }

    add(entity) {
        return Promise.resolve();
    }

    update(entity) {
        return Promise.resolve();
    }

    remove(id) {
        return Promise.resolve();
    }
}
