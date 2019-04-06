import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatTreeModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {BrickRegistry} from 'ngx-wall';
import {PageBrickComponent} from './bricks/page-brick/page-brick.component';
import {PageTreeFlatContainerComponent} from './containers/tree-flat/page-tree-flat-container.component';
import {PAGE_BRICK_TAG_NAME} from './page-ui.constant';
import {PageSearchContainerComponent} from './containers/search/page-search-container.component';
import {PageSearchModule} from '../search/page-search.module';
import {ReactiveFormsModule} from '@angular/forms';
import {FormControlsModule} from '../../../components/form-controls';

@NgModule({
    declarations: [
        PageTreeFlatContainerComponent,
        PageBrickComponent,
        PageSearchContainerComponent,
    ],
    entryComponents: [
        PageBrickComponent
    ],
    exports: [
        PageTreeFlatContainerComponent,
        PageSearchContainerComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormControlsModule,
        PageSearchModule,
        MatListModule,
        MatTreeModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressBarModule,
        RouterModule
    ]
})
export class PageUiModule {
    constructor(private brickRegistry: BrickRegistry) {
        if (!this.brickRegistry.get(PAGE_BRICK_TAG_NAME)) {
            this.brickRegistry.register({
                tag: PAGE_BRICK_TAG_NAME,
                component: PageBrickComponent,
                name: 'Page',
                description: 'Embed a sub-page inside this page'
            });
        }
    }
}
