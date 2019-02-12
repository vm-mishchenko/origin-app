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

        this.pouchdbStorageSettings.registerLocalDbName(options.name);

        return database;
    }
}
