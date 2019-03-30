import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {PouchdbStorageFactory} from './pouchdb-storage-factory.service';

@Injectable({
    providedIn: 'root'
})
export class PouchdbStorageSync {
    constructor(private pouchdbStorageFactory: PouchdbStorageFactory) {
    }

    sync(removeDbUrl: string): Promise<any> {
        const localPouchDb = this.pouchdbStorageFactory.getDatabase();
        const remotePouchDb = new PouchDB(removeDbUrl);

        return new Promise((resolve, reject) => {
            localPouchDb.sync(remotePouchDb)
                .on('complete', resolve)
                .on('error', reject);
        });
    }
}
