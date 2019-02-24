import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {GoogleSignModule} from '../../../features/google-sign/google-sign.module';
import {OriginPouchDbSyncModule} from '../../modules/origin-pouchdb-sync/origin-pouch-db-sync.module';
import {SettingsContainerComponent} from './containers/settings-container/settings-container.component';

const routes: Routes = [
    {
        path: '',
        component: SettingsContainerComponent
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
        GoogleSignModule,
        OriginPouchDbSyncModule,

        // material
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule
    ]
})
export class SettingsViewModule {
}
