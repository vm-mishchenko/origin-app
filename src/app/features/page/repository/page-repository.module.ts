import {NgModule} from '@angular/core';
import {AuthService} from '../../../modules/auth';
import {PouchDbSyncService} from '../../../modules/pouchdb-sync/pouch-db-sync.service';
import {PageRepositoryService2} from './page-repository.service2';
import {PageStoragesService2} from './page-storages.service2';

@NgModule({})
export class PageRepositoryModule {
    constructor(private pouchDbSyncService: PouchDbSyncService,
                private authService: AuthService,
                private pageStoragesService2: PageStoragesService2,
                private pageRepositoryService2: PageRepositoryService2,
    ) {
        this.authService.signOut$.subscribe(() => {
            // user log out
            this.pageStoragesService2.reset();
        });

        this.pouchDbSyncService.synced$.subscribe(() => {
            // todo: enable with new API
            this.pageRepositoryService2.sync();
            this.pageRepositoryService2.syncRootPages();
        });
    }
}
