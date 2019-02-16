import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GapiService} from './gapi.service';

@NgModule({
    providers: [
        GapiService
    ],
    imports: [
        CommonModule
    ]
})
export class GapiModule {
}
