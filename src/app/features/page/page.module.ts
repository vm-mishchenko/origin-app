import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WallModule} from 'ngx-wall';
import {PersistentStorageModule} from '../../infrastructure/persistent-storage';
import {UtilsModule} from '../../infrastructure/utils';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {PageService} from './page.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        WallModule,
        PersistentStorageModule,
        UtilsModule
    ],
    providers: [
        PageService,
        PageRepositoryService,
        PageStoragesService
    ]
})
export class PageModule {
}
