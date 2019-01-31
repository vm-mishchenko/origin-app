import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WallModule} from 'ngx-wall';
import {PersistentStorageModule} from '../../infrastructure/persistent-storage';
import {PageService} from './page.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        WallModule,
        PersistentStorageModule
    ],
    providers: [
        PageService,
    ]
})
export class PageModule {
    constructor(private pageService: PageService) {
    }
}
