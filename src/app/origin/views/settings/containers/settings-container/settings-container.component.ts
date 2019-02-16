import {Component, OnInit} from '@angular/core';
import {GoogleSignService} from '../../../../../features/google-sign/google-sign.service';

// todo: toggle automatically
@Component({
    selector: 'app-settings-container',
    templateUrl: './settings-container.component.html',
    styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent implements OnInit {
    constructor(public googleSignService: GoogleSignService) {
    }

    ngOnInit() {
    }
}
