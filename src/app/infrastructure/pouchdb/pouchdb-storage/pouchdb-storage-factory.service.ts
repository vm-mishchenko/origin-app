import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import {EntityStorePouchDb} from './entity-store-pouchdb';
import {IPouchDb, IPouchDbCreateOptions, IPouchdbStorageEntity} from './pouchdb-storage.types';

PouchDB.plugin(PouchFind);

const POUCH_STORAGE_LOCAL_DB_NAME_KEY = 'pouchdb-storage:local-database-name';

@Injectable()
export class PouchdbStorageFactory {
    private database: IPouchDb;

    constructor() {
        this.initializeDatabase();
    }

    createPouchDB<M extends IPouchdbStorageEntity>(options: IPouchDbCreateOptions) {
        return this.createEntityStorePouchDb<M>(options.name);
    }

    createEntityStorePouchDb<M extends IPouchdbStorageEntity>(name): EntityStorePouchDb<M> {
        return new EntityStorePouchDb(this.database, name);
    }

    getDatabase(): any {
        return this.database;
    }

    private initializeDatabase() {
        let localDbName = localStorage.getItem(POUCH_STORAGE_LOCAL_DB_NAME_KEY);

        if (!localDbName) {
            console.log(`Initialize new pouch database`);

            localDbName = String(Date.now());
            localStorage.setItem(POUCH_STORAGE_LOCAL_DB_NAME_KEY, localDbName);
        }

        this.database = new PouchDB(localDbName);
    }
}
