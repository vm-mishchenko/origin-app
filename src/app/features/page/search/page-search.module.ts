import {NgModule} from '@angular/core';
import {PageSearchService} from './page-search.service';
import {PageRepositoryModule} from '../repository';

@NgModule({
    declarations: [],
    imports: [
        PageRepositoryModule
    ],
    providers: [PageSearchService]
})
export class PageSearchModule {
}
