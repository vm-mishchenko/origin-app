import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {Observable} from 'rxjs';
import {PersistentStorage, PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {IIdentityPage} from './page.types';

@Injectable()
export class PageService {
    // todo: move to other service
    pages$: Observable<HashMap<IIdentityPage>>;

    private pageIdentityStorage: PersistentStorage<IIdentityPage>;

    constructor(private persistentStorageFactory: PersistentStorageFactory) {
        // initialize required storage
        this.pageIdentityStorage = this.persistentStorageFactory.create({
            name: 'page-identity'
        });

        this.pages$ = this.pageIdentityStorage.entities$;
    }

    createPage(): Promise<any> {
        const pageIdentity = {
            id: String(Date.now()),
            title: 'Default title'
        };

        return this.pageIdentityStorage.add(pageIdentity).then(() => pageIdentity);
    }

    removePage(id: string): Promise<any> {
        return this.pageIdentityStorage.remove(id);
    }
}
