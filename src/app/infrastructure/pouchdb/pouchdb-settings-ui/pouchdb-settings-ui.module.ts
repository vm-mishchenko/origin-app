import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {FormControlsModule} from '../../../components/form-controls';
import {PouchdbStorageModule} from '../pouchdb-storage/pouchdb-storage.module';
import {PouchdbSettingsContainerComponent} from './containers/pouchdb-settings-container/pouchdb-settings-container.component';

@NgModule({
    declarations: [PouchdbSettingsContainerComponent],
    exports: [PouchdbSettingsContainerComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PouchdbStorageModule,
        FormControlsModule,

        // material
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule
    ]
})
export class PouchdbSettingsUiModule {
}
