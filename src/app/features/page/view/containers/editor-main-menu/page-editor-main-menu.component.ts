import {Component, OnInit} from '@angular/core';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {PageViewQuery} from '../../state/page-view.query';

@Component({
    selector: 'app-page-editor-main-menu',
    templateUrl: './page-editor-main-menu.component.html',
    styleUrls: ['./page-editor-main-menu.component.scss']
})
export class PageEditorMainMenuComponent implements OnInit {
    constructor(public deviceLayoutService: DeviceLayoutService,
                public pageViewQuery: PageViewQuery) {
    }

    ngOnInit() {
    }
}
