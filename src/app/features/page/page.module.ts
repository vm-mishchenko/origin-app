import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PersistentStorageModule} from '../../infrastructure/persistent-storage';
import {PageService} from './page.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        PersistentStorageModule
    ],
    providers: [
        PageService,
    ]
})
export class PageModule {
    constructor(private pageService: PageService) {
        this.pageService.pages$.subscribe((pages) => {
            console.log(`pages`, pages);
        });
    }
}
