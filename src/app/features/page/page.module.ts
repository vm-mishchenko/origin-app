import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WALL_FILE_UPLOADER, WallModule} from 'ngx-wall';
import {FirebaseFileUploaderModule} from '../../infrastructure/firebase-file-uploader/firebase-file-uploader.module';
import {PersistentStorageModule} from '../../infrastructure/persistent-storage';
import {UtilsModule} from '../../infrastructure/utils';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {PageService} from './page.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        WallModule,
        PersistentStorageModule,
        UtilsModule,
        FirebaseFileUploaderModule
    ],
    providers: [
        PageService,
        PageRepositoryService,
        PageStoragesService,
        PageFileUploaderService
    ]
})
export class PageModule {
}
