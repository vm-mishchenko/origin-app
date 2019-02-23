import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {GapiModule} from '../../infrastructure/gapi';
import {GoogleSignService} from './google-sign.service';

@NgModule({
    imports: [
        CommonModule,
        GapiModule,
        AngularFireAuthModule
    ]
})
export class GoogleSignModule {
    constructor(private googleSignService: GoogleSignService) {
        this.googleSignService.initGapiClient();
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: GoogleSignModule,
            providers: [GoogleSignService]
        };
    }
}
