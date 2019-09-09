import {NgModule} from '@angular/core';
import {StorageSyncService} from '../../../modules/storage/storage-sync.service';
import {PageRepositoryService2} from './page-repository.service2';

@NgModule({})
export class PageRepositoryModule {
    constructor(private pouchDbSyncService: StorageSyncService,
                private pageRepositoryService2: PageRepositoryService2) {
        this.pouchDbSyncService.synced$.subscribe(() => {
            this.pageRepositoryService2.syncRootPages();
        });
    }
}
