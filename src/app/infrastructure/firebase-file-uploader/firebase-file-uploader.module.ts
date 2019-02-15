import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FirebaseFileUploaderService} from './firebase-file-uploader.service';

@NgModule({
    providers: [FirebaseFileUploaderService],
    imports: [
        CommonModule
    ]
})
export class FirebaseFileUploaderModule {
}
