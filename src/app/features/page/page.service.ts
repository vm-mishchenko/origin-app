import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {WallModelFactory} from 'ngx-wall';
import {Observable} from 'rxjs';
import {PersistentStorage, PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {IBodyPage, IIdentityPage} from './page.types';

@Injectable()
export class PageService {
    // todo: move to other service
    pages$: Observable<HashMap<IIdentityPage>>;

    private pageIdentityStorage: PersistentStorage<IIdentityPage>;
    private pageBodyStorage: PersistentStorage<IBodyPage>;

    constructor(private persistentStorageFactory: PersistentStorageFactory,
                private wallModelFactory: WallModelFactory) {
        // initialize required storage
        this.pageIdentityStorage = this.persistentStorageFactory.create<IIdentityPage>({
            name: 'page-identity'
        });

        this.pageBodyStorage = this.persistentStorageFactory.create<IBodyPage>({
            name: 'page-body'
        });

        this.pages$ = this.pageIdentityStorage.entities$;
    }

    createPage(): Promise<any> {
        const id = String(Date.now());

        const pageIdentity = {
            id,
            title: 'Default title'
        };

        const pageBody = {
            id,
            body: this.wallModelFactory.create().api.core.getPlan()
        };

        return Promise.all([
            this.pageIdentityStorage.add(pageIdentity),
            this.pageBodyStorage.add(pageBody)
        ]);
    }

    removePage(id: string): Promise<any> {
        return this.pageIdentityStorage.remove(id);
    }
}
