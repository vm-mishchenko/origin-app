import {NgModule} from '@angular/core';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {PouchDbSyncService} from '../../../modules/pouchdb-sync/pouch-db-sync.service';
import {AuthService} from '../../../modules/auth';

@NgModule({})
export class PageRepositoryModule {
    constructor(private pouchDbSyncService: PouchDbSyncService,
                private authService: AuthService,
                private pageRepositoryService: PageRepositoryService,
                private pageStoragesService: PageStoragesService) {
        this.authService.signOut$.subscribe(() => {
            // user log out
            this.pageStoragesService.reset();
        });

        this.pouchDbSyncService.synced$.subscribe(() => {
            this.pageStoragesService.sync();
            this.pageRepositoryService.loadRootPages();
        });
    }
}
