import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatIconModule, MatProgressBarModule, MatTreeModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {BrickRegistry, WallModule} from 'ngx-wall';
import {PageModule} from '../page/page.module';
import {PageTreeFlatContainerComponent} from './containers/page-tree-flat-container/page-tree-flat-container.component';
import {PageBrickComponent} from './bricks/page-brick/page-brick.component';

@NgModule({
    declarations: [
        PageTreeFlatContainerComponent,
        PageBrickComponent
    ],
    entryComponents: [
        PageBrickComponent
    ],
    exports: [PageTreeFlatContainerComponent],
    imports: [
        CommonModule,
        PageModule,
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
            tag: 'page',
            component: PageBrickComponent,
            name: 'Page',
            description: 'Embed a sub-page inside this page'
        });
    }
}
