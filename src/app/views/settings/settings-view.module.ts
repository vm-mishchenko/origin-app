import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule, MatInputModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {PouchdbStorageModule} from '../../infrastructure/pouchdb-storage';
import {SettingsContainerComponent} from './containers/settings-container/settings-container.component';

const routes: Routes = [
    {
        path: '',
        component: SettingsContainerComponent,
    },
    {
        path: '*',
        redirectTo: '',
    }
];

@NgModule({
    declarations: [SettingsContainerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,

        PouchdbStorageModule,

        // material
        MatInputModule,
        MatFormFieldModule
    ]
})
export class SettingsViewModule {
}
