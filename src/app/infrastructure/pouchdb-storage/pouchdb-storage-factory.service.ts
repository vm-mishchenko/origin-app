import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import {PouchdbStorageSettings} from './pouchdb-storage-settings.service';

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
    constructor(private pouchdbStorageSettings: PouchdbStorageSettings) {
    }

    createPouchDB(options: IPouchDbCreateOptions) {
        const database = new PouchDB(options.name);

        console.log(`createPouchDB`);
        this.pouchdbStorageSettings.addLocalDbName(options.name);

        // todo: save info about this DB so it could be deleted in a future
        return database;
    }
}
