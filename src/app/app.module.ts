import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {FirebaseOptionsToken} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GoogleSignModule} from './features/google-sign/google-sign.module';
import {NavigationModule} from './features/navigation';
import {PouchdbStorageModule} from './infrastructure/pouchdb/pouchdb-storage';
import {OriginPouchDbSyncModule} from './origin/modules/origin-pouchdb-sync/origin-pouch-db-sync.module';

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
        PouchdbStorageModule.forRoot(),
        GoogleSignModule.forRoot(),

        // application level
        OriginPouchDbSyncModule,

        // todo-hack: https://github.com/angular/material2/issues/10820
        OverlayModule,

        // todo: consider move to appropriate modules
        AngularFireAuthModule,
        AngularFireDatabaseModule
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
