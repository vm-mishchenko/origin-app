import {Component, OnInit} from '@angular/core';
import {NavigationService} from '../../../../../modules/navigation';
import {PageService} from '../../../../page/repository';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {ShellStore} from '../../state/shell.store';

@Component({
    selector: 'app-shell-welcome-container',
    templateUrl: './shel-welcome-container.component.html',
    styleUrls: ['./shell-welcome-container.component.scss']
})
export class ShellWelcomeContainerComponent implements OnInit {
    constructor(private pageService: PageService,
                private shellStore: ShellStore,
                private deviceLayoutService: DeviceLayoutService,
                private navigationService: NavigationService) {
    }

    ngOnInit() {
        if (this.deviceLayoutService.isNarrowLayout()) {
            this.shellStore.closeMenu();
        }
    }

    awesomeStuffStartsHere() {
        this.pageService.createPage2().then((newPageId) => {
            this.navigationService.toPage(newPageId);
        });
    }
}
