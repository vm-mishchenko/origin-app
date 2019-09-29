import {MatDialogRef} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {DeviceLayoutService} from '../../infrastructure/device-layout/device-layout.service';

export class ResizableDialog<T, R> {
    constructor(readonly dialogRef: MatDialogRef<T, R>, private deviceLayoutService: DeviceLayoutService) {
        this.deviceLayoutService.isNarrowLayout() ? this.switchToFullScreen() : this.switchToDefaultScreen();

        this.deviceLayoutService.isNarrowLayout$.pipe(
          takeUntil(this.dialogRef.afterClosed())
        ).subscribe((isNarrowLayout) => {
            if (isNarrowLayout) {
                this.switchToFullScreen();
            } else {
                this.switchToDefaultScreen();
            }
        });
    }

    switchToFullScreen() {
        this.dialogRef.removePanelClass('default-screen');
        this.dialogRef.addPanelClass('full-screen');
    }

    switchToDefaultScreen() {
        this.dialogRef.removePanelClass('full-screen');
        this.dialogRef.addPanelClass('default-screen');
    }
}
