import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PouchdbStorageModule} from '../pouchdb-storage';
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
