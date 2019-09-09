import {Inject, Injectable} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {MatSnackBar} from '@angular/material';
import {DatabaseManager, PouchDbRemoteProvider} from 'cinatabase';
import {Observable, Subject} from 'rxjs';
import {filter, first} from 'rxjs/operators';
import {AuthService} from '../auth';
import {IPouchDbConfig} from './pouchdb-config';
import {DATABASE_MANAGER, REMOTE_PROVIDER_INJECTION_TOKEN} from './storage.module';

@Injectable({
    providedIn: 'root'
})
export class StorageSyncService {
    synced$: Observable<any> = new Subject();
    private syncPromise: Promise<any>;
    private pouchDbConfig: IPouchDbConfig;

    constructor(private googleSignService: AuthService,
                private angularFireDatabase: AngularFireDatabase,
                @Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager,
                @Inject(REMOTE_PROVIDER_INJECTION_TOKEN) private remoteProvider: PouchDbRemoteProvider,
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
            this.databaseManager.removeAllData();
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

                this.sync();
            });
    }

    sync() {
        if (!this.pouchDbConfig) {
            // pouchDbConfig is not received from firebase,
            // because we are offline or is just in process of loading
            return Promise.resolve();
        }

        const remoteDatabaseUrl = `https://${this.pouchDbConfig.key}:${this.pouchDbConfig.password}@${this.pouchDbConfig.domain}/${this.pouchDbConfig.name}`;

        this.remoteProvider.configure({
            remoteDatabaseUrl
        });

        // cache promise to avoid unnecessary double sync call
        if (!this.syncPromise) {
            this.syncPromise = this.databaseManager.syncWithServer().then(() => {
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
