import {NgModule} from '@angular/core';
import {PouchdbStorageModule} from '../pouchdb/pouchdb-storage';
import {PersistentStorageFactory} from './persistent-storage-factory.service';

@NgModule({
    imports: [
        PouchdbStorageModule
    ],
    providers: [PersistentStorageFactory]
})
export class PersistentStorageModule {
}
