import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule, MatListModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ShellContainerComponent} from './containers/shell/shell-container.component';

@NgModule({
    declarations: [ShellContainerComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatListModule,
        MatCardModule,
    ]
})
export class ShellViewModule {
}
