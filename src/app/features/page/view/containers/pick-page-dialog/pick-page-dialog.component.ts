import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {IPageSearchItem} from '../../../search/page-search.service';

@Component({
    selector: 'app-pick-page-dialog',
    templateUrl: './pick-page-dialog.component.html',
    styleUrls: ['./pick-page-dialog.component.scss']
})
export class PickPageDialogComponent {
    constructor(public dialogRef: MatDialogRef<PickPageDialogComponent>) {
    }

    selectItem(pageSearchItem: IPageSearchItem): void {
        this.dialogRef.close(pageSearchItem);
    }
}
