import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {AuthModule} from '../../../modules/auth';
import {PouchDbSyncModule} from '../../../modules/pouchdb-sync/pouch-db-sync.module';
import {SettingsContainerComponent} from './containers/settings/settings-container.component';

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
