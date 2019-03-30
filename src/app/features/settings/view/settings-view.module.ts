import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {SettingsContainerComponent} from './containers/settings/settings-container.component';
import {ShellViewModule} from '../../shell/view';

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
        ShellViewModule,

        // material
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule
    ]
})
export class SettingsViewModule {
}
