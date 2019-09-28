import {MatDialogRef} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {DeviceLayoutService} from '../../infrastructure/device-layout/device-layout.service';

export class ResizableDialog<T, R> {
    constructor(readonly dialog: MatDialogRef<T, R>, private deviceLayoutService: DeviceLayoutService) {
        this.deviceLayoutService.isNarrowLayout$.pipe(
          takeUntil(this.dialog.afterClosed())
        ).subscribe((isNarrowLayout) => {
            if (isNarrowLayout) {
                this.switchToFullScreen();
            } else {
                this.switchToDefaultScreen();
            }
        });
    }

    switchToFullScreen() {
        this.dialog.removePanelClass('default-screen');
        this.dialog.addPanelClass('full-screen');
    }

    switchToDefaultScreen() {
        this.dialog.removePanelClass('full-screen');
        this.dialog.addPanelClass('default-screen');
    }
}
