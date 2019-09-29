import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {ISelectedPage} from '../pick-page/components/list/page-pick-list.component';

@Component({
    templateUrl: './pick-page-dialog.component2.html',
    styleUrls: ['./pick-page-dialog.component2.scss']
})
export class PickPageDialogComponent2 {
    constructor(public dialogRef: MatDialogRef<PickPageDialogComponent2>) {
    }

    selectPage(selectedPage: ISelectedPage): void {
        this.dialogRef.close(selectedPage);
    }

    onNoClick() {
        this.dialogRef.close();
    }
}
