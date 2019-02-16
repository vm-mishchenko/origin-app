import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {FirebaseFileUploaderService} from './firebase-file-uploader.service';

@NgModule({
    providers: [
        FirebaseFileUploaderService
    ],
    imports: [
        CommonModule,
        AngularFireStorageModule
    ]
})
export class FirebaseFileUploaderModule {
}
