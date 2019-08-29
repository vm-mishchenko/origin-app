import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {FirebaseOptionsToken} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {MatBottomSheetModule, MatDialogModule, MatSnackBarModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {WallModule} from 'ngx-wall';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PageRepositoryModule} from './features/page/repository';
import {ShellViewModule} from './features/shell/view';
import {NavigationModule} from './modules/navigation';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        BrowserAnimationsModule,
        NavigationModule,
        PageRepositoryModule,
        ShellViewModule.forRoot(),
        WallModule.forRoot(),

        // firebase
        AngularFireAuthModule,
        AngularFireStorageModule,
        AngularFireDatabaseModule,

        // material
        MatDialogModule,
        MatSnackBarModule,
        MatBottomSheetModule,

        // todo-hack: https://github.com/angular/material2/issues/10820
        OverlayModule
    ],
    providers: [
        {
            provide: FirebaseOptionsToken, useValue: environment.FIREBASE_CONFIG
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
