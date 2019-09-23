import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DialogWrapperService} from '../../services/dialog-wrapper.service';

@Component({
    selector: 'first-dialog',
    templateUrl: './first-dialog.html',
})
export class FirstDialog {
    constructor(public dialogRef: MatDialogRef<FirstDialog>,
                public dialogWrapperService: DialogWrapperService) {
    }

    openSecondDialog() {
        console.log(`openSecondDialog`);
        this.dialogWrapperService.open(FirstDialog);


        this.dialogRef.close();
    }
}
