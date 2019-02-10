import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
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
    ]
})
export class SettingsViewModule {
}
