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
import {PouchDbSyncModule} from './modules/pouchdb-sync/pouch-db-sync.module';
import {PageRepositoryModule} from './features/page/repository';
import {ShellViewModule} from './features/shell/view';
import {WallModule} from 'ngx-wall';

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
        AuthModule,
        PageRepositoryModule.forRoot(),
        ShellViewModule.forRoot(),
        WallModule.forRoot(),

        // application level
        PouchDbSyncModule,

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
