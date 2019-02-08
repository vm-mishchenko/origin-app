import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatSidenavModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {
    CodeBrickModule,
    DividerBrickModule,
    HeaderBrickModule,
    ImgBrickModule,
    PickOutModule,
    QuoteBrickModule,
    RadarModule,
    TextBrickModule,
    TowModule,
    VideoBrickModule,
    WallModule,
    WebBookmarkBrickModule
} from 'ngx-wall';
import {FormControlsModule} from '../../components/form-controls';
import {NavigationModule} from '../../features/navigation';
import {PageUiModule} from '../../features/page-ui';
import {PageModule} from '../../features/page/page.module';
import {PageEditorComponent} from './components/page-editor/page-editor.component';
import {PageBaseViewContainerComponent} from './containers/page-base-view-container/page-base-view-container.component';
import {PageEditorViewContainerComponent} from './containers/page-editor-view-container/page-editor-view-container.component';
import { TitlePageEditorContainerComponent } from './containers/title-page-editor-container/title-page-editor-container.component';
import { BodyPageEditorContainerComponent } from './containers/body-page-editor-container/body-page-editor-container.component';

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
        PageBaseViewContainerComponent,
        PageEditorComponent,
        TitlePageEditorContainerComponent,
        BodyPageEditorContainerComponent
    ],
    imports: [
        CommonModule,
        PageModule,
        PageUiModule,
        MatSidenavModule,
        MatButtonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        FormControlsModule,
        NavigationModule,

        // wall main module
        WallModule,

        // wall bricks
        QuoteBrickModule,
        TextBrickModule,
        DividerBrickModule,
        VideoBrickModule,
        HeaderBrickModule,
        ImgBrickModule,
        CodeBrickModule,
        WebBookmarkBrickModule,
        PickOutModule,
        TowModule,
        RadarModule,
        WebBookmarkBrickModule
    ]
})
export class PageViewModule {
}
