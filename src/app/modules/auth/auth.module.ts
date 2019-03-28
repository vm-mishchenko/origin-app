import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {GapiModule} from '../../infrastructure/gapi';
import {AuthService} from './auth.service';

@NgModule({
    imports: [
        CommonModule,
        GapiModule,
        AngularFireAuthModule
    ]
})
export class AuthModule {
    constructor(private googleSignService: AuthService) {
        this.googleSignService.initGapiClient();
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AuthModule,
            providers: [AuthService]
        };
    }
}