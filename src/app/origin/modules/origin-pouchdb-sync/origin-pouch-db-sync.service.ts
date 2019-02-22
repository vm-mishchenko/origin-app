import {Injectable} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {filter} from 'rxjs/operators';
import {GoogleSignService} from '../../../features/google-sign/google-sign.service';
import {PouchdbStorageSync} from '../../../infrastructure/pouchdb/pouchdb-storage/pouchdb-storage-sync.service';

/*
* Knowledge:
* 1. how to retrieve CouchDb credentials
*
* Responsibilities:
* 1. initial database sync
* 2. not implemented - database sync from Settings page
* */

export interface IPouchDbConfig {
    key: string;
    password: string;
    name: string;
    domain: string;
}

@Injectable()
export class OriginPouchDbSyncService {
    private pouchDbConfig: IPouchDbConfig;

    constructor(private googleSignService: GoogleSignService,
                private angularFireDatabase: AngularFireDatabase,
                private pouchdbStorageSync: PouchdbStorageSync) {
        this.googleSignService.user$.pipe(
            filter((user) => Boolean(user))
        ).subscribe((user) => {
            this.angularFireDatabase.object(`users/${user.uid}/couchDbConfig`)
                .valueChanges()
                .pipe(
                    filter((couchDbConfig) => Boolean(couchDbConfig))
                )
                .subscribe((couchDbConfig) => {
                    this.pouchDbConfig = couchDbConfig as IPouchDbConfig;

                    this.syncPouchDb();
                });
        });
    }

    syncPouchDb() {
        const remoteDatabaseUrl = `https://${this.pouchDbConfig.key}:${this.pouchDbConfig.password}@${this.pouchDbConfig.domain}/${this.pouchDbConfig.name}`;

        this.pouchdbStorageSync.sync(remoteDatabaseUrl).then(() => {
            console.log(`Pouch Db is synced successfully`);
        });
    }
}
