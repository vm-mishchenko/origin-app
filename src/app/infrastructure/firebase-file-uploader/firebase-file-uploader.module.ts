import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileUploaderService} from 'ngx-wall';
import {FirebaseFileUploaderService} from './firebase-file-uploader.service';

@NgModule({
    providers: [FirebaseFileUploaderService],
    imports: [
        CommonModule,
        FileUploaderService
    ]
})
export class FirebaseFileUploaderModule {
}
