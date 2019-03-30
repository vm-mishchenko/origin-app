import {Injectable} from '@angular/core';
import {PersistentStorage, PersistentStorageFactory} from '../../../infrastructure/persistent-storage';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';
import {AuthService} from '../../../modules/auth';

@Injectable({
    providedIn: 'root'
})
export class PageStoragesService {
    pageIdentityStorage: PersistentStorage<IIdentityPage>;
    pageBodyStorage: PersistentStorage<IBodyPage>;
    pageRelationStorage: PersistentStorage<IRelationPage>;

    constructor(private persistentStorageFactory: PersistentStorageFactory,
                private authService: AuthService) {
        // initialize required storage
        this.pageIdentityStorage = this.persistentStorageFactory.create<IIdentityPage>({
            name: 'page-identity'
        });
        this.pageBodyStorage = this.persistentStorageFactory.create<IBodyPage>({
            name: 'page-body'
        });
        this.pageRelationStorage = this.persistentStorageFactory.create<IRelationPage>({
            name: 'page-relation'
        });

        this.authService.signOut$.subscribe(() => {
            // user log out
            this.reset();
        });
    }

    reset() {
        this.pageIdentityStorage.reset();
        this.pageBodyStorage.reset();
        this.pageRelationStorage.reset();
    }

    sync(): Promise<any> {
        return Promise.all([
            this.pageIdentityStorage.sync(),
            this.pageBodyStorage.sync(),
            this.pageRelationStorage.sync()
        ]);
    }
}
