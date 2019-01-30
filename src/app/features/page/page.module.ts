import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PageIdentitiesQuery} from './page-identity-query.service';
import {PageService} from './page.service';
import {StoreFactory} from './store.factory';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        PageService,
        PageIdentitiesQuery,
        StoreFactory
    ]
})
export class PageModule {
    constructor(private pageService: PageService) {
        this.pageService.createPage();
    }
}
