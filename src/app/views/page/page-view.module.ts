import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {PageUiModule} from '../../features/page-ui';
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
        PageUiModule,
        MatSidenavModule,
        MatButtonModule,
        RouterModule.forChild(routes)
    ]
})
export class PageViewModule {
}
