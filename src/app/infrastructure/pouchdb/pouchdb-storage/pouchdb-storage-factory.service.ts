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

    private entityStorePouchDbMap: Map<string, EntityStorePouchDb<IPouchdbStorageEntity>> = new Map();

    constructor() {
        this.initializeDatabase();
    }

    createPouchDB<M extends IPouchdbStorageEntity>(options: IPouchDbCreateOptions) {
        const entityStorePouchDb = this.createEntityStorePouchDb<M>(options.name);

        this.entityStorePouchDbMap.set(options.name, entityStorePouchDb);

        return entityStorePouchDb;
    }

    createEntityStorePouchDb<M extends IPouchdbStorageEntity>(name): EntityStorePouchDb<M> {
        return new EntityStorePouchDb(this.database, name);
    }

    getDatabase(): any {
        return this.database;
    }

    resetDatabase() {
        return (this.database as any).destroy().then(() => {
            this.initializeDatabase();

            this.entityStorePouchDbMap.forEach((entityStorePouchDb) => {
                entityStorePouchDb.reInitializeDatabase(this.database);
            });
        });
    }

    private initializeDatabase() {
        let localDbName = localStorage.getItem(POUCH_STORAGE_LOCAL_DB_NAME_KEY);

        if (!localDbName) {
            localDbName = this.getLocalDbName();
            localStorage.setItem(POUCH_STORAGE_LOCAL_DB_NAME_KEY, localDbName);
        }

        this.database = new PouchDB(localDbName);
    }

    private getLocalDbName(): string {
        return String(Date.now());
    }
}
