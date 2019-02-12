import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {PouchdbSettingsContainerComponent} from '../../infrastructure/pouchdb-storage/pouchdb-settings-ui/containers/pouchdb-settings-container/pouchdb-settings-container.component';
import {PouchdbSettingsUiModule} from '../../infrastructure/pouchdb-storage/pouchdb-settings-ui/pouchdb-settings-ui.module';
import {SettingsContainerComponent} from './containers/settings-container/settings-container.component';

const routes: Routes = [
    {
        path: '',
        component: SettingsContainerComponent,
        children: [
            {
                path: 'database',
                component: PouchdbSettingsContainerComponent
            },
        ]
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
        PouchdbSettingsUiModule,

        // material
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule
    ]
})
export class SettingsViewModule {
}
