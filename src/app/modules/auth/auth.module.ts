import {NgModule} from '@angular/core';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AuthService} from './auth.service';

@NgModule({
    imports: [
        AngularFireAuthModule
    ]
})
export class AuthModule {
    constructor(private googleSignService: AuthService) {
        this.googleSignService.initGapiClient();
    }
}
