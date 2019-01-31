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
