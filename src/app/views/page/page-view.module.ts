import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageModule} from '../../features/page/page.module';
import {PageBaseViewContainerComponent} from './containers/page-base-view-container/page-base-view-container.component';
import {PageEditorViewContainerComponent} from './containers/page-editor-view-container/page-editor-view-container.component';

const routes: Routes = [
    {
        path: '',
        component: PageBaseViewContainerComponent,
        canActivate: [],
        canActivateChild: [],
        children: [
            {
                path: ':id',
                component: PageEditorViewContainerComponent
            },
        ]
    },
    {
        path: '*',
        redirectTo: '',
    }
];

@NgModule({
    declarations: [
        PageEditorViewContainerComponent,
        PageBaseViewContainerComponent
    ],
    imports: [
        CommonModule,
        PageModule,
        RouterModule.forChild(routes)
    ]
})
export class PageViewModule {
}
