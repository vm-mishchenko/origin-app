import {NgModule} from '@angular/core';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {GoogleSignModule} from '../../../features/google-sign/google-sign.module';
import {PouchdbStorageModule} from '../../../infrastructure/pouchdb/pouchdb-storage';
import {OriginPouchDbSyncService} from './origin-pouch-db-sync.service';

@NgModule({
    providers: [OriginPouchDbSyncService],
    imports: [
        GoogleSignModule,
        AngularFireDatabaseModule,
        PouchdbStorageModule
    ]
})
export class OriginPouchDbSyncModule {
    // initialize originPouchDbSyncService service
    // todo: find the way to do it in application level
    constructor(private originPouchDbSyncService: OriginPouchDbSyncService) {
    }
}
