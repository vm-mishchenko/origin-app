import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {BaseViewContainerComponent} from './containers/base-container/base-view-container.component';

@NgModule({
    declarations: [BaseViewContainerComponent],
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class BaseViewModule {
}
