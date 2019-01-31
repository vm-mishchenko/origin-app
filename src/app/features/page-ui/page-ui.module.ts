import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatIconModule, MatProgressBarModule, MatTreeModule} from '@angular/material';
import {PageModule} from '../page/page.module';
import {PageTreeFlatContainerComponent} from './containers/page-tree-flat-container/page-tree-flat-container.component';

@NgModule({
    declarations: [
        PageTreeFlatContainerComponent
    ],
    exports: [PageTreeFlatContainerComponent],
    imports: [
        CommonModule,
        PageModule,
        MatTreeModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule
    ]
})
export class PageUiModule {
}
