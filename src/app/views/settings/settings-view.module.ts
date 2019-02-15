import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {GoogleSignModule} from '../../features/google-sign/google-sign.module';
import {PouchdbSettingsContainerComponent} from '../../infrastructure/pouchdb/pouchdb-settings-ui/containers/pouchdb-settings-container/pouchdb-settings-container.component';
import {PouchdbSettingsUiModule} from '../../infrastructure/pouchdb/pouchdb-settings-ui/pouchdb-settings-ui.module';
import {SettingsContainerComponent} from './containers/settings-container/settings-container.component';

const routes: Routes = [
    {
        path: '',
        component: SettingsContainerComponent,
        children: [
            {
                path: 'database',
                component: PouchdbSettingsContainerComponent
            }
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
        GoogleSignModule,

        // material
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule
    ]
})
export class SettingsViewModule {
}
