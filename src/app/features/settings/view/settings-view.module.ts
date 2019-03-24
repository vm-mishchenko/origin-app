import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {AuthModule} from '../../../modules/auth';
import {PouchDbSyncModule} from '../../../modules/pouchdb-sync/pouch-db-sync.module';
import {SettingsContainerComponent} from './containers/settings/settings-container.component';
import {ShellViewModule} from '../../shell/view';
import {DeviceLayoutModule} from '../../../infrastructure/device-layout/device-layout.module';

const routes: Routes = [
    {
        path: '',
        component: SettingsContainerComponent
    }
];

@NgModule({
    declarations: [SettingsContainerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        AuthModule,
        ShellViewModule,
        DeviceLayoutModule,
        PouchDbSyncModule,

        // material
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule
    ]
})
export class SettingsViewModule {
}
