import {Component, OnInit} from '@angular/core';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {ShellStore} from '../../../../shell/view/state/shell.store';

@Component({
    selector: 'app-page-search-page',
    templateUrl: './page-search-page.component.html',
    styleUrls: ['./page-search-page.component.scss']
})
export class PageSearchPageComponent implements OnInit {
    constructor(private shellStore: ShellStore,
                private deviceLayoutService: DeviceLayoutService) {
    }

    ngOnInit() {
        if (this.deviceLayoutService.isMobileLayout()) {
            this.shellStore.closeMenu();
        }
    }
}
