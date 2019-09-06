import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DeviceLayoutService} from '../../../../../infrastructure/device-layout/device-layout.service';
import {MatSidenav} from '@angular/material';
import {ShellStore} from '../../state/shell.store';
import {ShellQuery} from '../../state/shell.query';
import {PageRepositoryService, PageService} from '../../../../page/repository';
import {NavigationService} from '../../../../../modules/navigation';
import {PouchDbSyncService} from '../../../../../modules/pouchdb-sync/pouch-db-sync.service';
import {ComponentPortal, Portal} from '@angular/cdk/portal';
import {AuthService} from '../../../../../modules/auth';

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
                public authService: AuthService,
                private shellStore: ShellStore,
                public shellQuery: ShellQuery,
                private pageService: PageService,
                private navigationService: NavigationService,
                private pageRepositoryService: PageRepositoryService,
                private changeDetectorRef: ChangeDetectorRef,
                public originPouchDbSyncService: PouchDbSyncService) {
        this.pageRepositoryService.loadRootPages();
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
        this.originPouchDbSyncService.syncPouchDb();
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
