import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {GoogleSignModule} from '../../../features/google-sign/google-sign.module';
import {PouchdbStorageModule} from '../../../infrastructure/pouchdb/pouchdb-storage';
import {OriginPouchDbSyncService} from './origin-pouch-db-sync.service';

@NgModule({
    providers: [OriginPouchDbSyncService],
    imports: [
        CommonModule,
        GoogleSignModule,
        AngularFirestoreModule,
        PouchdbStorageModule
    ]
})
export class OriginPouchDbSyncModule {
    // initialize originPouchDbSyncService service
    // todo: find the way to do it in application level
    constructor(private originPouchDbSyncService: OriginPouchDbSyncService) {
    }
}
