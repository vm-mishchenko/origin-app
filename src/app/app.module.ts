import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {FirebaseOptionsToken} from '@angular/fire';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthModule} from './modules/auth';
import {NavigationModule} from './modules/navigation';
import {PouchdbStorageModule} from './infrastructure/pouchdb/pouchdb-storage';
import {PouchDbSyncModule} from './modules/pouchdb-sync/pouch-db-sync.module';
import {DeviceLayoutModule} from './infrastructure/device-layout/device-layout.module';
import {PageRepositoryModule} from './features/page/repository';
import {ShellViewModule} from './features/shell/view';

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
        AuthModule.forRoot(),
        DeviceLayoutModule.forRoot(),
        PageRepositoryModule.forRoot(),
        ShellViewModule.forRoot(),

        // application level
        PouchDbSyncModule.forRoot(),

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
