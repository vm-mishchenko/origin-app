import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShellContainerComponent, ShellViewModule} from './features/shell/view';

const routes: Routes = [
    {
        path: '',
        component: ShellContainerComponent,
        children: [
            {
                path: 'page',
                loadChildren: './features/page/view/page-view.module#PageViewModule'
            },
            {
                path: 'settings',
                loadChildren: './features/settings/view/settings-view.module#SettingsViewModule'
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        ShellViewModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
