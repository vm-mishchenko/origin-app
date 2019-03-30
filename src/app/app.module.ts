import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {FirebaseOptionsToken} from '@angular/fire';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavigationModule} from './modules/navigation';
import {PageRepositoryModule} from './features/page/repository';
import {ShellViewModule} from './features/shell/view';
import {WallModule} from 'ngx-wall';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {MatBottomSheetModule, MatDialogModule, MatSnackBarModule} from '@angular/material';
import {AngularFireAuthModule} from '@angular/fire/auth';

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
