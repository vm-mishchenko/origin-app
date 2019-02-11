import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-settings-container',
    templateUrl: './settings-container.component.html',
    styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent implements OnInit {
    pageForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.pageForm = this.formBuilder.group({
            url: this.formBuilder.control('')
        });
    }

    ngOnInit() {
    }
}
