import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {filter, map} from 'rxjs/operators';
import {PageLockConfigChange} from '../../../config/configs/page-lock-config.constant';
import {PageConfigStorageService} from '../../../config/page-config-storage.service';
import {PageService} from '../../../repository';
import {DialogWrapperService} from '../../services/dialog-wrapper.service';
import {PageViewQuery} from '../../state/page-view.query';
import {PickPageDialogComponent} from '../pick-page-dialog/pick-page-dialog.component';

@Component({
    selector: 'app-page-menu-container',
    templateUrl: './page-menu-container.component.html',
    styleUrls: ['./page-menu-container.component.scss']
})
export class PageMenuContainerComponent implements OnInit {
    // "isLocked" page config  value
    isPageLocked$: Observable<boolean> = this.pageViewQuery.isPageLocked$;

    constructor(private pageViewQuery: PageViewQuery,
                private pageService: PageService,
                private pageConfigStorageService: PageConfigStorageService,
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
            this.pageService.movePage2(this.pageViewQuery.getSelectedPageId(), pageId);
        });
    }

    moveToRoot() {
        this.pageService.movePage2(this.pageViewQuery.getSelectedPageId());
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

    lockPage() {
        this.setPageIsLockConfig(true);
    }

    unlockPage() {
        this.setPageIsLockConfig(false);
    }

    private setPageIsLockConfig(isPageLocked: boolean): Promise<any> {
        const changeEvent = new PageLockConfigChange(this.pageViewQuery.getSelectedPageId(), isPageLocked);
        return this.pageConfigStorageService.changeConfig(changeEvent);
    }
}
