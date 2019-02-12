import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {PouchdbStorageSettings} from '../../../pouchdb-storage/pouchdb-storage-settings.service';
import {PouchdbStorageSync} from '../../../pouchdb-storage/pouchdb-storage-sync.service';

@Component({
    selector: 'app-pouchdb-settings-container',
    templateUrl: './pouchdb-settings-container.component.html',
    styleUrls: ['./pouchdb-settings-container.component.scss']
})
export class PouchdbSettingsContainerComponent implements OnInit, OnDestroy {
    pageForm: FormGroup;

    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                public pouchdbStorageSettings: PouchdbStorageSettings,
                private pouchdbStorageSync: PouchdbStorageSync) {
        this.pageForm = this.formBuilder.group({
            url: this.formBuilder.control(this.pouchdbStorageSettings.remoteDbUrl)
        });
    }

    ngOnInit() {
        this.subscriptions.push(
            this.pageForm.valueChanges.subscribe((newFormValues) => {
                this.pouchdbStorageSettings.setRemoteDbUrl(newFormValues.url);
            })
        );
    }

    sync() {
        this.pouchdbStorageSync.sync();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
