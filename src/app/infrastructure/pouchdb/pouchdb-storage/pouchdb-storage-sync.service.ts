import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {PouchdbStorageSettings} from './pouchdb-storage-settings.service';

@Injectable()
export class PouchdbStorageSync {
    constructor(private pouchdbStorageSettings: PouchdbStorageSettings) {
    }

    sync(): Promise<any> {
        return Promise.all(
            this.pouchdbStorageSettings.localDbNames.map((localDbName) => {
                const localPouchDb = new PouchDB(localDbName);
                const remotePouchDb = new PouchDB(`${this.pouchdbStorageSettings.remoteDbUrl}/${localDbName}`);

                return new Promise((resolve, reject) => {
                    localPouchDb.sync(remotePouchDb)
                        .on('complete', resolve)
                        .on('error', (e) => {
                            console.log(`err`, e);
                            reject();
                        });
                });
            })
        ).then(() => {
            alert('Done');
        }).catch(() => {
            alert('Fail');
        });
    }
}
