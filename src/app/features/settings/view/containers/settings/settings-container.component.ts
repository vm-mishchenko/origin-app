import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../../modules/auth';
import {PouchDbSyncService} from '../../../../../modules/pouchdb-sync/pouch-db-sync.service';

// todo: toggle automatically
@Component({
    selector: 'app-settings-container',
    templateUrl: './settings-container.component.html',
    styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent implements OnInit {
    constructor(public googleSignService: AuthService,
                public originPouchDbSyncService: PouchDbSyncService) {
    }

    ngOnInit() {
    }
}
