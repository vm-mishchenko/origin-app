import {NgModule} from '@angular/core';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {MatSnackBarModule} from '@angular/material';

@NgModule({
    imports: [
        // todo: abstract from where app receive configuration
        AngularFireDatabaseModule,
        MatSnackBarModule
    ]
})
export class PouchDbSyncModule {
}
