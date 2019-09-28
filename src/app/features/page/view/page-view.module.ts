import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {NgxInputProjectionModule} from 'ngx-input-projection';
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
import {ShellViewModule} from '../../shell/view';
import {PageUiModule} from '../ui';
import {PageEditorComponent} from './components/editor/page-editor.component';
import {FirstDialog} from './containers/base/first-dialog';
import {PageBaseContainerComponent} from './containers/base/page-base-container.component';
import {PageBodyEditorContainerComponent} from './containers/body-editor/page-body-editor-container.component';
import {PageBreadcrumbsContainerComponent} from './containers/breadcrumbs/page-breadcrumbs-container.component';
import {PageEditorMainMenuComponent} from './containers/editor-main-menu/page-editor-main-menu.component';
import {PageEditorContainerComponent} from './containers/editor/page-editor-container.component';
import {PageMenuContainerComponent} from './containers/menu/page-menu-container.component';
import {PageMiniBreadcrumbsContainerComponent} from './containers/mini-breadcrumbs/page-mini-breadcrumbs-container.component';
import {PickPageDialogComponent} from './containers/pick-page-dialog/pick-page-dialog.component';
import {PagePickInputComponent} from './containers/pick-page/components/input/page-pick-input.component';
import {PagePickListComponent, PagePickNavigateDirective} from './containers/pick-page/components/list/page-pick-list.component';
import {PageTitleEditorContainerComponent} from './containers/title-editor/page-title-editor-container.component';
import {PageViewFileUploaderService} from './page-view-file-uploader.service';
import {PageSearchPageComponent} from './pages/search/page-search-page.component';
import {BottomSheetWrapperService} from './services/bottom-sheet-wrapper.service';
import {Dialog, DialogWrapperService} from './services/dialog-wrapper.service';
import {PageBreadcrumbStream} from './state/page-breadcrumbs-view.stream';
import {PageViewQuery} from './state/page-view.query';
import {PageViewStore} from './state/page-view.store';

const routes: Routes = [
    {
        path: 'search',
        component: PageSearchPageComponent
    },
    {
        path: '',
        component: PageBaseContainerComponent,
        children: [
            {
                path: ':id',
                component: PageEditorContainerComponent
            },
        ]
    }
];

@NgModule({
    declarations: [
        PageEditorContainerComponent,
        PageBaseContainerComponent,
        PageEditorComponent,
        PageTitleEditorContainerComponent,
        PageBodyEditorContainerComponent,
        PageSearchPageComponent,
        PageBreadcrumbsContainerComponent,
        PageMenuContainerComponent,
        PickPageDialogComponent,
        PageMiniBreadcrumbsContainerComponent,
        PageEditorMainMenuComponent,
        PagePickInputComponent,
        PagePickListComponent,
        PagePickNavigateDirective,

        //test
        FirstDialog
    ],
    entryComponents: [
        PickPageDialogComponent,
        PageMenuContainerComponent,
        PageBreadcrumbsContainerComponent,
        PageMiniBreadcrumbsContainerComponent,
        PageEditorMainMenuComponent,

        //test
        FirstDialog
    ],
    imports: [
        NgxInputProjectionModule,
        CommonModule,
        PageUiModule,
        ShellViewModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        FormControlsModule,
        NavigationModule,

        FormsModule,
        ReactiveFormsModule,

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
        PickOutModule,
        TowModule,
        RadarModule,
        WebBookmarkBrickModule,

        // material
        MatListModule,
        MatCardModule,
        MatSidenavModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    providers: [
        PageBreadcrumbStream,
        BottomSheetWrapperService,
        DialogWrapperService,
        Dialog,
        PageViewStore,
        PageViewQuery,
        {
            provide: WALL_FILE_UPLOADER,
            useClass: PageViewFileUploaderService
        }
    ]
})
export class PageViewModule {
}
