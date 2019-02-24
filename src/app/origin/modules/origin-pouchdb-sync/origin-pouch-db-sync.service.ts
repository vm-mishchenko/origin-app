import {Injectable} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {filter, first} from 'rxjs/operators';
import {GoogleSignService} from '../../../features/google-sign';
import {PouchdbStorageFactory} from '../../../infrastructure/pouchdb/pouchdb-storage';
import {PouchdbStorageSync} from '../../../infrastructure/pouchdb/pouchdb-storage/pouchdb-storage-sync.service';
import {IPouchDbConfig} from './origin-pouchdb-sync.types';

/*
* Knowledge:
* 1. how to retrieve CouchDb credentials
*
* Responsibilities:
* 1. initial database sync
* 2. database sync from Settings page
* */

@Injectable()
export class OriginPouchDbSyncService {
    private pouchDbConfig: IPouchDbConfig;

    constructor(private googleSignService: GoogleSignService,
                private angularFireDatabase: AngularFireDatabase,
                private pouchdbStorageFactory: PouchdbStorageFactory,
                private pouchdbStorageSync: PouchdbStorageSync) {
        this.googleSignService.user$.pipe(
            first(),
            filter((user) => Boolean(user))
        ).subscribe((user) => {
            // user is already logged in
            this.initialPouchDbSync(user);
        });

        this.googleSignService.signIn$.subscribe((user) => {
            // user was sign out but during current session logged in
            this.initialPouchDbSync(user);
        });

        this.googleSignService.signOut$.subscribe(() => {
            // user log out
            this.pouchDbConfig = null;
            this.pouchdbStorageFactory.resetDatabase();
        });
    }

    private initialPouchDbSync(user) {
        this.angularFireDatabase.object(`users/${user.uid}/couchDbConfig`)
            .valueChanges()
            .pipe(
                filter((couchDbConfig) => Boolean(couchDbConfig)),
                first()
            )
            .subscribe((couchDbConfig) => {
                this.pouchDbConfig = couchDbConfig as IPouchDbConfig;

                this.syncPouchDb();
            });
    }

    syncPouchDb() {
        const remoteDatabaseUrl = `https://${this.pouchDbConfig.key}:${this.pouchDbConfig.password}@${this.pouchDbConfig.domain}/${this.pouchDbConfig.name}`;

        this.pouchdbStorageSync.sync(remoteDatabaseUrl).then(() => {
            console.log(`Pouch Db is synced successfully`);
        });
    }
}
