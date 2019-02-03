import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';

PouchDB.plugin(PouchFind);

/*
* Allow
*   - create
*   - delete
*   - sync
* */
export interface IPouchDbCreateOptions {
    name: string;
}

@Injectable()
export class PouchdbStorageFactory {
    private databasePrefixName: string;

    constructor() {
    }

    setDatabaseNamePrefix(databasePrefixName: string) {
        this.databasePrefixName = databasePrefixName;
    }

    createPouchDB(options: IPouchDbCreateOptions) {
        const databaseName = this.databasePrefixName ?
            `${this.databasePrefixName}-${options.name}` :
            options.name;

        const database = new PouchDB(databaseName);

        // todo: save info about this DB so it could be deleted in a future

        return database;
    }
}
