import {ComponentPortal, Portal} from '@angular/cdk/portal';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {NavigationService} from '../../../../../modules/navigation';
import {StorageSyncService} from '../../../../../modules/storage/storage-sync.service';
import {PageService} from '../../../../page/repository';
import {PageRepositoryService2} from '../../../../page/repository/page-repository.service2';
import {ShellQuery} from '../../state/shell.query';
import {ShellStore} from '../../state/shell.store';

@Component({
    selector: 'app-shell-container',
    templateUrl: './shell-container.component.html',
    styleUrls: ['./shell-container.component.scss']
})
export class ShellContainerComponent implements OnInit {
    @ViewChild('sidenav') private sidenav: MatSidenav;

    mainPortal: Portal<any>;
    secondaryPortal: Portal<any>;

    constructor(public deviceLayoutService: DeviceLayoutService,
                private shellStore: ShellStore,
                public shellQuery: ShellQuery,
                private pageService: PageService,
                private navigationService: NavigationService,
                private pageRepositoryService2: PageRepositoryService2,
                private changeDetectorRef: ChangeDetectorRef,
                public originPouchDbSyncService: StorageSyncService) {
        this.pageRepositoryService2.syncRootPages();
    }

    ngOnInit() {
        this.deviceLayoutService.mobileLayout$.subscribe(() => {
            this.changeDetectorRef.detectChanges();
        });

        this.sidenav.openedChange.subscribe((value) => {
            if (value) {
                this.shellStore.openMenu();
            } else {
                this.shellStore.closeMenu();
            }
        });

        this.shellQuery.isMenuOpen$.subscribe((isMenuOpen) => {
            if (isMenuOpen) {
                this.sidenav.open();
            } else {
                this.sidenav.close();
            }
        });
    }

    toggleMenu() {
        this.shellStore.toggleMenu();
    }

    addPage() {
        this.pageService.createPage2().then((newPageId) => {
            this.navigationService.toPage(newPageId);
        });
    }

    sync() {
        this.originPouchDbSyncService.sync();
    }

    setMainPortalComponent(componentPortal: ComponentPortal<any>) {
        this.mainPortal = componentPortal;
    }

    setSecondaryPortalComponent(componentPortal: ComponentPortal<any>) {
        this.secondaryPortal = componentPortal;
    }

    clearMainPortal() {
        this.mainPortal = null;
    }

    clearSecondaryPortal() {
        this.secondaryPortal = null;
    }
}
