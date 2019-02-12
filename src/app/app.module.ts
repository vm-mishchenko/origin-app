import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavigationModule} from './features/navigation';
import {PouchdbStorageModule} from './infrastructure/pouchdb/pouchdb-storage';

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

        // todo-hack: https://github.com/angular/material2/issues/10820
        OverlayModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
