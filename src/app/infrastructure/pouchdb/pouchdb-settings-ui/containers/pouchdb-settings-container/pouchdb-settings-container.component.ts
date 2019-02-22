import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
    selector: 'app-pouchdb-settings-container',
    templateUrl: './pouchdb-settings-container.component.html',
    styleUrls: ['./pouchdb-settings-container.component.scss']
})
export class PouchdbSettingsContainerComponent implements OnInit, OnDestroy {
    pageForm: FormGroup;

    constructor() {

    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}
