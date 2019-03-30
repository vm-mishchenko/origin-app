import {ModuleWithProviders, NgModule} from '@angular/core';
import {WallModule} from 'ngx-wall';
import {FirebaseFileUploaderModule} from '../../../infrastructure/firebase-file-uploader/firebase-file-uploader.module';
import {UtilsModule} from '../../../infrastructure/utils';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {PageService} from './page.service';

@NgModule({
    imports: [
        WallModule,
        UtilsModule,
        FirebaseFileUploaderModule
    ]
})
export class PageRepositoryModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: PageRepositoryModule,
            providers: [
                PageService,
                PageRepositoryService,
                PageStoragesService,
                PageFileUploaderService
            ]
        };
    }
}
