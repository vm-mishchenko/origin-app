import {ModuleWithProviders, NgModule} from '@angular/core';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AuthModule} from '../auth';
import {PouchdbStorageModule} from '../../infrastructure/pouchdb/pouchdb-storage';
import {PouchDbSyncService} from './pouch-db-sync.service';

@NgModule({
    imports: [
        AuthModule,
        // todo: abstract from where app receive configuration
        AngularFireDatabaseModule,
        PouchdbStorageModule
    ]
})
export class PouchDbSyncModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: PouchDbSyncModule,
            providers: [PouchDbSyncService],
        };
    }

    // initialize originPouchDbSyncService service
    // todo: find the way to initialize necessary services in application level
    constructor(private originPouchDbSyncService: PouchDbSyncService) {
    }
}
