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
    WallModule,
    WebBookmarkBrickModule
} from 'ngx-wall';
import {FormControlsModule} from '../../../components/form-controls';
import {NavigationModule} from '../../../modules/navigation';
import {PageModule} from '../repository';
import {PageUiModule} from '../ui';
import {OriginPageModule} from '../../../modules/origin-page';
import {PageEditorComponent} from './components/editor/page-editor.component';
import {PageBodyEditorContainerComponent} from './containers/body-editor/page-body-editor-container.component';
import {PageBaseContainerComponent} from './containers/base/page-base-container.component';
import {PageEditorContainerComponent} from './containers/editor/page-editor-container.component';
import {PageTitleEditorContainerComponent} from './containers/title-editor/page-title-editor-container.component';
import {PageViewQuery} from './state/page-view.query';
import {PageViewStore} from './state/page-view.store';

console.log(`test`);

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
        PageModule,
        PageUiModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        FormControlsModule,
        NavigationModule,

        // Origin
        OriginPageModule,

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
        PageViewQuery
    ]
})
export class PageViewModule {
}
