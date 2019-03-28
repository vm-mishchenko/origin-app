import {ModuleWithProviders, NgModule} from '@angular/core';
import {WallModule} from 'ngx-wall';
import {FirebaseFileUploaderModule} from '../../../infrastructure/firebase-file-uploader/firebase-file-uploader.module';
import {PersistentStorageModule} from '../../../infrastructure/persistent-storage';
import {UtilsModule} from '../../../infrastructure/utils';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {PageService} from './page.service';
import {AuthModule, AuthService} from '../../../modules/auth';

@NgModule({
    imports: [
        WallModule,
        UtilsModule,
        // AuthModule,
        PersistentStorageModule,
        FirebaseFileUploaderModule
    ]
})
export class PageRepositoryModule {
    constructor(/*private authService: AuthService,*/
                private pageStoragesService: PageStoragesService) {
        /*this.authService.signOut$.subscribe(() => {
            // user log out
            this.pageStoragesService.reset();
        });*/
    }

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
