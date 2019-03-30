import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ShellContainerComponent} from './containers/shell/shell-container.component';
import {ShellStore} from './state/shell.store';
import {ShellQuery} from './state/shell.query';
import {PageRepositoryModule} from '../../page/repository';
import {PageUiModule} from '../../page/ui';
import {NavigationModule} from '../../../modules/navigation';
import {PortalModule} from '@angular/cdk/portal';

@NgModule({
    declarations: [ShellContainerComponent],
    imports: [
        PageUiModule,
        NavigationModule,
        CommonModule,
        RouterModule,
        MatListModule,
        MatCardModule,
        MatSidenavModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        PortalModule
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
