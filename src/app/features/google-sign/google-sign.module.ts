import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GapiModule} from '../../infrastructure/gapi';
import {GoogleSignService} from './google-sign.service';

@NgModule({
    providers: [GoogleSignService],
    imports: [
        CommonModule,
        GapiModule
    ]
})
export class GoogleSignModule {
}
