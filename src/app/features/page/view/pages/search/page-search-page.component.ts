import {Component, OnInit} from '@angular/core';
import {IPageSearchItem} from '../../../search/page-search.service';
import {NavigationService} from '../../../../../modules/navigation';

@Component({
    selector: 'app-page-search-page',
    templateUrl: './page-search-page.component.html',
    styleUrls: ['./page-search-page.component.scss']
})
export class PageSearchPageComponent implements OnInit {
    constructor(private navigationService: NavigationService) {
    }

    ngOnInit() {
    }

    selectItem(pageSearchItem: IPageSearchItem) {
        this.navigationService.toPage(pageSearchItem.pageId);
    }
}
