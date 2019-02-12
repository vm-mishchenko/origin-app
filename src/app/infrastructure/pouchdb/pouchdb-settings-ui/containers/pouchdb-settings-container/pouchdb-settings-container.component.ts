import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/internal/operators';
import {PouchdbStorageSettings} from '../../../pouchdb-storage/pouchdb-storage-settings.service';
import {PouchdbStorageSync} from '../../../pouchdb-storage/pouchdb-storage-sync.service';

@Component({
    selector: 'app-pouchdb-settings-container',
    templateUrl: './pouchdb-settings-container.component.html',
    styleUrls: ['./pouchdb-settings-container.component.scss']
})
export class PouchdbSettingsContainerComponent implements OnInit {
    pageForm: FormGroup;

    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                public pouchdbStorageSettings: PouchdbStorageSettings,
                private pouchdbStorageSync: PouchdbStorageSync) {
        this.pageForm = this.formBuilder.group({
            url: this.formBuilder.control('')
        });
    }

    ngOnInit() {
        this.subscriptions.push(
            this.pageForm.valueChanges.pipe(
                filter(newFormValue => Boolean(newFormValue.url))
            ).subscribe((newFormValue) => {
                this.pouchdbStorageSettings.setRemoteDbUrl(newFormValue.url);
            })
        );
    }

    sync() {
        this.pouchdbStorageSync.sync();
    }
}
