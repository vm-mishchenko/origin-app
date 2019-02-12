import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {PouchdbStorageFactory} from './pouchdb-storage-factory.service';
import {PouchdbStorageSettings} from './pouchdb-storage-settings.service';
import {PouchdbStorageSync} from './pouchdb-storage-sync.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ]
})
export class PouchdbStorageModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: PouchdbStorageModule,
            providers: [PouchdbStorageFactory, PouchdbStorageSettings, PouchdbStorageSync]
        };
    }
}
