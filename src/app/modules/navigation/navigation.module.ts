import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NavigationService} from './navigation.service';

// todo: move to application level modules
@NgModule({
    declarations: [],
    providers: [NavigationService],
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class NavigationModule {
}
