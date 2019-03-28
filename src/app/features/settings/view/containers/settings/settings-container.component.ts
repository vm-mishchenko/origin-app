import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../../modules/auth';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {ShellStore} from '../../../../shell/view/state/shell.store';

// todo: toggle automatically
@Component({
    selector: 'app-settings-container',
    templateUrl: './settings-container.component.html',
    styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent implements OnInit {
    constructor(public authService: AuthService,
                private deviceLayoutService: DeviceLayoutService,
                private shellStore: ShellStore) {
        console.log(`Settings initialized`);
    }

    ngOnInit() {
        if (this.deviceLayoutService.isMobileLayout()) {
            this.shellStore.closeMenu();
        }
    }
}
