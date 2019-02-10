import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BaseViewContainerComponent, BaseViewModule} from './views/base';

const routes: Routes = [
    {
        path: '',
        component: BaseViewContainerComponent,
        canActivate: [],
        canActivateChild: [],
        children: [
            {
                path: 'page',
                loadChildren: './views/page/page-view.module#PageViewModule'
            },
            {
                path: 'settings',
                loadChildren: './views/settings/settings-view.module#SettingsViewModule'
            }
        ]
    },
    {
        path: '*',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        BaseViewModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
