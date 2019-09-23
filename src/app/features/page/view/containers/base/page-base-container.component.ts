import {Component, OnDestroy, OnInit} from '@angular/core';
import {DialogWrapperService} from '../../services/dialog-wrapper.service';
import {FirstDialog} from './first-dialog';

@Component({
    selector: 'app-page-base-view-container',
    templateUrl: './page-base-container.component.html',
    styleUrls: ['./page-base-container.component.scss']
})
export class PageBaseContainerComponent implements OnInit, OnDestroy {
    constructor(public dialogWrapperService: DialogWrapperService) {

    }

    ngOnInit() {

    }

    ngOnDestroy(): void {
    }

    openDialog() {
        this.dialogWrapperService.open(FirstDialog);
        console.log(`openDialog`);


    }
}
