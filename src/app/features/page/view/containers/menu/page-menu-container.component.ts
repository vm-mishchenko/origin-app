import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {PageConfigStorageService} from '../../../config/page-config-storage.service';
import {PageService} from '../../../repository';
import {Dialog} from '../../services/dialog-wrapper.service';
import {PageViewQuery} from '../../state/page-view.query';
import {PickPageDialogComponent2} from '../pick-page-dialog-2/pick-page-dialog.component2';
import {ISelectedPage} from '../pick-page/components/list/page-pick-list.component';

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
                private dialog: Dialog) {
    }

    ngOnInit() {
    }

    moveTo() {
        this.dialog
          .openResizable<PickPageDialogComponent2, /*data*/any, /*return type*/ISelectedPage>
          (PickPageDialogComponent2).dialogRef.afterClosed()
            .pipe(
              filter((result) => {
                  return Boolean(result);
              }),
              map((result) => {
                  return result.id;
              })
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

        this.dialog.openResizable(PickPageDialogComponent2).dialogRef.afterClosed()
            .pipe(
                filter((result) => Boolean(result)),
              map((result) => result.id)
            ).subscribe((pageId) => {

            this.pageService.moveBricks2(this.pageViewQuery.getSelectedPageId(),
                selectedBrickIds,
                pageId);
        });
    }

    remove() {
        if (confirm('Are you sure?')) {
            this.pageService.removePage2(this.pageViewQuery.getSelectedPageId());
        }
    }

    lockPage() {
        this.setPageIsLockConfig(true);
    }

    unlockPage() {
        this.setPageIsLockConfig(false);
    }

    private setPageIsLockConfig(isPageLocked: boolean): Promise<any> {
        if (isPageLocked) {
            return this.pageConfigStorageService.lockPage(this.pageViewQuery.getSelectedPageId());
        } else {
            return this.pageConfigStorageService.unlockPage(this.pageViewQuery.getSelectedPageId());
        }
    }
}
