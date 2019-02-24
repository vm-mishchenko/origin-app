import {ModuleWithProviders, NgModule} from '@angular/core';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {GoogleSignModule} from '../../../features/google-sign';
import {PouchdbStorageModule} from '../../../infrastructure/pouchdb/pouchdb-storage';
import {OriginPouchDbSyncService} from './origin-pouch-db-sync.service';

@NgModule({
    imports: [
        GoogleSignModule,
        // todo: abstract from where app receive configuration
        AngularFireDatabaseModule,
        PouchdbStorageModule
    ]
})
export class OriginPouchDbSyncModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: OriginPouchDbSyncModule,
            providers: [OriginPouchDbSyncService],
        };
    }

    // initialize originPouchDbSyncService service
    // todo: find the way to initialize necessary services in application level
    constructor(private originPouchDbSyncService: OriginPouchDbSyncService) {
    }
}
