import {Component, OnInit} from '@angular/core';
import {PageSearchService} from '../../../search/page-search.service';

@Component({
    selector: 'app-page-search-container',
    templateUrl: './page-search-container.component.html',
    styleUrls: ['./page-search-container.component.scss']
})
export class PageSearchContainerComponent implements OnInit {
    constructor(private pageSearchService: PageSearchService) {
    }

    ngOnInit() {
        this.pageSearchService.search('test');
    }
}
