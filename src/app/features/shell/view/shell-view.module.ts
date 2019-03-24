import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ShellContainerComponent} from './containers/shell/shell-container.component';
import {ShellStore} from './state/shell.store';
import {ShellQuery} from './state/shell.query';
import {DeviceLayoutModule} from '../../../infrastructure/device-layout/device-layout.module';
import {PageModule} from '../../page/repository';
import {PageUiModule} from '../../page/ui';
import {NavigationModule} from '../../../modules/navigation';

@NgModule({
    declarations: [ShellContainerComponent],
    imports: [
        DeviceLayoutModule,
        PageModule,
        PageUiModule,
        NavigationModule,
        CommonModule,
        RouterModule,
        MatListModule,
        MatCardModule,
        MatSidenavModule,
        MatButtonModule,
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
