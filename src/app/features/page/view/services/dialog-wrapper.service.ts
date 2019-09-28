import {ComponentType} from '@angular/cdk/portal';
import {Injectable, TemplateRef} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {DeviceLayoutService} from '../../../../infrastructure/device-layout/device-layout.service';
import {ResizableDialog} from '../../../../modules/dialog';

/*
* Dont ask what the heck is that.
* 2 years are passed, situation is still there
* https://github.com/angular/angular/issues/14324
* Just use that dialog instead of default MatDialog.
* */
@Injectable()
export class DialogWrapperService extends MatDialog {
}

@Injectable()
export class Dialog {
    constructor(private dialogWrapperService: DialogWrapperService, private deviceLayoutService: DeviceLayoutService) {
    }

    openResizable<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, config?: MatDialogConfig<D>): ResizableDialog<T, R> {
        const matDialogRef = this.dialogWrapperService.open(componentOrTemplateRef, config);
        return new ResizableDialog(matDialogRef, this.deviceLayoutService);
    }
}
