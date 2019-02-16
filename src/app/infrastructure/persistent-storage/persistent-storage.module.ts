import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PouchdbStorageModule} from '../pouchdb/pouchdb-storage';
import {PersistentStorageFactory} from './persistent-storage-factory.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        PouchdbStorageModule
    ],
    providers: [PersistentStorageFactory]
})
export class PersistentStorageModule {
}
