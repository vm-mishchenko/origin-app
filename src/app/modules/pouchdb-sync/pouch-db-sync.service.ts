import {Injectable} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {filter, first} from 'rxjs/operators';
import {AuthService} from '../auth';
import {PouchdbStorageFactory} from '../../infrastructure/pouchdb/pouchdb-storage';
import {PouchdbStorageSync} from '../../infrastructure/pouchdb/pouchdb-storage/pouchdb-storage-sync.service';
import {IPouchDbConfig} from './pouchdb-sync.types';
import {MatSnackBar} from '@angular/material';
import {Observable, Subject} from 'rxjs';

/*
* Knowledge:
* 1. how to retrieve CouchDb credentials
*
* Responsibilities:
* 1. initial database sync
* 2. database sync from Settings page
* */

@Injectable({
    providedIn: 'root'
})
export class PouchDbSyncService {
    private syncPromise: Promise<any>;

    synced$: Observable<any> = new Subject();
    private pouchDbConfig: IPouchDbConfig;

    constructor(private googleSignService: AuthService,
                private angularFireDatabase: AngularFireDatabase,
                private pouchdbStorageFactory: PouchdbStorageFactory,
                private pouchdbStorageSync: PouchdbStorageSync,
                private snackBar: MatSnackBar) {
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

        // cache promise to avoid unnecessary double sync call
        if (!this.syncPromise) {
            this.syncPromise = this.pouchdbStorageSync.sync(remoteDatabaseUrl).then(() => {
                (this.synced$ as Subject<any>).next();

                this.snackBar.open('App is synced', '', {
                    duration: 2500 /* milliseconds */
                });
            }).finally(() => {
                this.syncPromise = null;
            });
        }

        return this.syncPromise;
    }
}
