import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ShellContainerComponent} from './containers/shell/shell-container.component';
import {ShellStore} from './state/shell.store';
import {ShellQuery} from './state/shell.query';
import {DeviceLayoutModule} from '../../../infrastructure/device-layout/device-layout.module';
import {PageRepositoryModule} from '../../page/repository';
import {PageUiModule} from '../../page/ui';
import {NavigationModule} from '../../../modules/navigation';
import {PouchDbSyncModule} from '../../../modules/pouchdb-sync/pouch-db-sync.module';

@NgModule({
    declarations: [ShellContainerComponent],
    imports: [
        DeviceLayoutModule,
        PageRepositoryModule,
        PageUiModule,
        PouchDbSyncModule,
        NavigationModule,
        CommonModule,
        RouterModule,
        MatListModule,
        MatCardModule,
        MatSidenavModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule
    ]
})
export class ShellViewModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ShellViewModule,
            providers: [
                ShellStore,
                ShellQuery
            ]
        };
    }
}
