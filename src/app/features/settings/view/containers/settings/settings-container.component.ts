import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../../modules/auth';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {ShellStore} from '../../../../shell/view/state/shell.store';
import {PouchDbSyncService} from '../../../../../modules/pouchdb-sync/pouch-db-sync.service';

// todo: toggle automatically
@Component({
    selector: 'app-settings-container',
    templateUrl: './settings-container.component.html',
    styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent implements OnInit {
    constructor(public authService: AuthService,
                private deviceLayoutService: DeviceLayoutService,
                private pouchDbSyncService: PouchDbSyncService,
                private shellStore: ShellStore) {
    }

    ngOnInit() {
        if (this.deviceLayoutService.isMobileLayout()) {
            this.shellStore.closeMenu();
        }
    }
}
