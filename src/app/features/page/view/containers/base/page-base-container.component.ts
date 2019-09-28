import {Component, OnDestroy, OnInit} from '@angular/core';
import {Dialog} from '../../services/dialog-wrapper.service';
import {FirstDialog} from './first-dialog';

@Component({
    selector: 'app-page-base-view-container',
    templateUrl: './page-base-container.component.html',
    styleUrls: ['./page-base-container.component.scss']
})
export class PageBaseContainerComponent implements OnInit, OnDestroy {
    constructor(private dialog: Dialog) {
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
    }

    openDialog() {
        this.dialog.openResizable(FirstDialog);
    }
}
