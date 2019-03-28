import {Component, OnInit} from '@angular/core';
import {PageViewQuery} from '../../state/page-view.query';
import {PageService} from '../../../repository';

@Component({
    selector: 'app-page-menu-container',
    templateUrl: './page-menu-container.component.html',
    styleUrls: ['./page-menu-container.component.scss']
})
export class PageMenuContainerComponent implements OnInit {

    constructor(private pageViewQuery: PageViewQuery,
                private pageService: PageService) {
    }

    ngOnInit() {
    }

    moveTo(pageId: string) {
        this.pageService.movePage(pageId);
    }

    moveToRoot() {
        this.pageService.movePage(this.pageViewQuery.getSelectedPageId());
    }

    moveBrickTo() {
        const targetPageId = window.prompt('Target page id');

        if (targetPageId) {
            this.pageService.moveBricks(this.pageViewQuery.getSelectedPageId(),
                this.pageViewQuery.getSelectedBrickIds(),
                targetPageId);
        }
    }

    remove() {
        if (confirm('Are you sure?')) {
            this.pageService.removePage(this.pageViewQuery.getSelectedPageId());
        }
    }
}
