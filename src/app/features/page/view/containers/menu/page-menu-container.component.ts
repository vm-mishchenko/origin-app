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
        // store selected brick ids
        // because during page selection (in dialog) that value will be lost
        // wall reacts on each document click and unselect bricks
        const selectedBrickIds = this.pageViewQuery.getSelectedBrickIds();

        if (!selectedBrickIds.length) {
            return;
        }

        this.dialogWrapperService.open(PickPageDialogComponent).afterClosed()
            .pipe(
                filter((result) => Boolean(result)),
                map((result) => result.pageId)
            ).subscribe((pageId) => {

            this.pageService.moveBricks(this.pageViewQuery.getSelectedPageId(),
                selectedBrickIds,
                pageId);
        });
    }

    remove() {
        if (confirm('Are you sure?')) {
            this.pageService.removePage(this.pageViewQuery.getSelectedPageId());
        }
    }
}
