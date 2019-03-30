import {Component, OnInit} from '@angular/core';
import {PageViewQuery} from '../../state/page-view.query';
import {PageService} from '../../../repository';
import {MatDialog} from '@angular/material';
import {PickPageDialogComponent} from '../pick-page-dialog/pick-page-dialog.component';
import {DialogWrapperService} from '../../services/dialog-wrapper.service';
import {filter, map} from 'rxjs/internal/operators';

@Component({
    selector: 'app-page-menu-container',
    templateUrl: './page-menu-container.component.html',
    styleUrls: ['./page-menu-container.component.scss']
})
export class PageMenuContainerComponent implements OnInit {

    constructor(private pageViewQuery: PageViewQuery,
                private pageService: PageService,
                public dialog: MatDialog,
                public dialogWrapperService: DialogWrapperService) {
    }

    ngOnInit() {
    }

    moveTo() {
        this.dialogWrapperService.open(PickPageDialogComponent).afterClosed()
            .pipe(
                filter((result) => Boolean(result)),
                map((result) => result.pageId)
            ).subscribe((pageId) => {
            this.pageService.movePage(this.pageViewQuery.getSelectedPageId(), pageId);
        });
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
