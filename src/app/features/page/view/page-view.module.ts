import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatListModule, MatSidenavModule} from '@angular/material';
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
    WALL_FILE_UPLOADER,
    WallModule,
    WebBookmarkBrickModule
} from 'ngx-wall';
import {FormControlsModule} from '../../../components/form-controls';
import {NavigationModule} from '../../../modules/navigation';
import {PageFileUploaderService, PageRepositoryModule} from '../repository';
import {PageUiModule} from '../ui';
import {PageEditorComponent} from './components/editor/page-editor.component';
import {PageBodyEditorContainerComponent} from './containers/body-editor/page-body-editor-container.component';
import {PageBaseContainerComponent} from './containers/base/page-base-container.component';
import {PageEditorContainerComponent} from './containers/editor/page-editor-container.component';
import {PageTitleEditorContainerComponent} from './containers/title-editor/page-title-editor-container.component';
import {ShellViewModule} from '../../shell/view';
import {DeviceLayoutModule} from '../../../infrastructure/device-layout/device-layout.module';
import {PageViewStore} from './state/page-view.store';
import {PageViewQuery} from './state/page-view.query';

const routes: Routes = [
    {
        path: '',
        component: PageBaseContainerComponent,
        canActivate: [],
        canActivateChild: [],
        children: [
            {
                path: ':id',
                component: PageEditorContainerComponent
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
        PageEditorContainerComponent,
        PageBaseContainerComponent,
        PageEditorComponent,
        PageTitleEditorContainerComponent,
        PageBodyEditorContainerComponent
    ],
    imports: [
        CommonModule,
        PageRepositoryModule,
        PageUiModule,
        ShellViewModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        FormControlsModule,
        NavigationModule,
        DeviceLayoutModule,

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
        WebBookmarkBrickModule,

        // material
        MatListModule,
        MatCardModule,
        MatSidenavModule,
        MatButtonModule,
    ],
    providers: [
        PageViewStore,
        PageViewQuery,
        {
            provide: WALL_FILE_UPLOADER,
            useClass: PageFileUploaderService
        }
    ]
})
export class PageViewModule {
}
