import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import PouchUpsert from 'pouchdb-upsert';

PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchUpsert);

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
    constructor() {
    }

    createPouchDB(options: IPouchDbCreateOptions) {
        const database = new PouchDB(options.name);

        // todo: save info about this DB so it could be deleted in a future
        return database;
    }
}
