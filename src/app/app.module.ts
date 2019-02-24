import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {FirebaseOptionsToken} from '@angular/fire';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GoogleSignModule} from './features/google-sign';
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
        OriginPouchDbSyncModule.forRoot(),

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
