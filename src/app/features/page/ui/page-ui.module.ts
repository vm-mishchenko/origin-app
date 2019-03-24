import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatIconModule, MatListModule, MatProgressBarModule, MatTreeModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {BrickRegistry, WallModule} from 'ngx-wall';
import {PageRepositoryModule} from '../repository';
import {PageBrickComponent} from './bricks/page-brick/page-brick.component';
import {PageTreeFlatContainerComponent} from './containers/tree-flat/page-tree-flat-container.component';
import {PAGE_BRICK_TAG_NAME} from './page-ui.constant';
import {PageSearchContainerComponent} from './containers/search/page-search-container.component';
import {PageSearchModule} from '../search/page-search.module';

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
        PageSearchModule,
        PageRepositoryModule,
        MatListModule,
        MatTreeModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        RouterModule,
        WallModule
    ]
})
export class PageUiModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: PAGE_BRICK_TAG_NAME,
            component: PageBrickComponent,
            name: 'Page',
            description: 'Embed a sub-page inside this page'
        });
    }
}
