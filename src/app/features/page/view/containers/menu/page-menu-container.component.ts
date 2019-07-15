import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {filter, map, switchMap} from 'rxjs/operators';
import {PAGE_LOCK_CONFIG_ITEM_TYPE, PageLockConfigChange} from '../../../config/configs/page-lock-config.constant';
import {PageConfigRepositoryService} from '../../../config/page-config-repository.service';
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
    isPageLocked$: Observable<boolean>;

    constructor(private pageViewQuery: PageViewQuery,
                private pageService: PageService,
                private pageConfigStorageService: PageConfigStorageService,
                private pageConfigRepositoryService: PageConfigRepositoryService,
                public dialogWrapperService: DialogWrapperService) {
    }

    ngOnInit() {
        // receive "isLocked" page config  value
        this.isPageLocked$ = this.pageViewQuery.selectedPageId$.pipe(
            switchMap((selectedPageId) => {
                return this.pageConfigRepositoryService.get$(selectedPageId).pipe(
                    map((pageConfig) => {
                        return pageConfig[PAGE_LOCK_CONFIG_ITEM_TYPE];
                    })
                );
            })
        );
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
