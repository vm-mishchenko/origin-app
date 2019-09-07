import {NgModule} from '@angular/core';
import {AuthService} from '../../../modules/auth';
import {PouchDbSyncService} from '../../../modules/pouchdb-sync/pouch-db-sync.service';
import {PageRepositoryService2} from './page-repository.service2';
import {PageStoragesService} from './page-storages.service';

@NgModule({})
export class PageRepositoryModule {
    constructor(private pouchDbSyncService: PouchDbSyncService,
                private authService: AuthService,
                private pageRepositoryService2: PageRepositoryService2,
                private pageStoragesService: PageStoragesService) {
        this.authService.signOut$.subscribe(() => {
            // user log out
            this.pageStoragesService.reset();
        });

        this.pouchDbSyncService.synced$.subscribe(() => {
            // todo: enable with new API
            this.pageRepositoryService2.sync();
            this.pageRepositoryService2.syncRootPages();
        });
    }
}
