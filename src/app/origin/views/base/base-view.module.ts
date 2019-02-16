import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule, MatListModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {BaseViewContainerComponent} from './containers/base-container/base-view-container.component';

@NgModule({
    declarations: [BaseViewContainerComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatListModule,
        MatCardModule,
    ]
})
export class BaseViewModule {
}
