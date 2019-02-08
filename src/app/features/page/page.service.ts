import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {PersistentStorage} from '../../infrastructure/persistent-storage';
import {Guid} from '../../infrastructure/utils';
import {CreatePageAction} from './action/create-page.action';
import {RemovePageAction} from './action/remove-page.action';
import {DeletePageEvent} from './page-events.type';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Injectable()
export class PageService {
    // todo: move to other service
    pageIdentity$: Observable<HashMap<IIdentityPage>>;
    pageRelation$: Observable<HashMap<IRelationPage>>;

    // todo - integrate to application event stream
    // todo - replace any type
    events$: Observable<any> = new Subject<any>();

    private pageIdentityStorage: PersistentStorage<IIdentityPage>;
    private pageBodyStorage: PersistentStorage<IBodyPage>;
    private pageRelationStorage: PersistentStorage<IRelationPage>;

    constructor(private pageStoragesService: PageStoragesService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory,
                private guid: Guid) {
        // initialize required storage
        this.pageIdentityStorage = this.pageStoragesService.pageIdentityStorage;
        this.pageBodyStorage = this.pageStoragesService.pageBodyStorage;
        this.pageRelationStorage = this.pageStoragesService.pageRelationStorage;

        // todo: move to the separate query service
        this.pageIdentity$ = this.pageRepositoryService.pageIdentity$;
        this.pageRelation$ = this.pageRepositoryService.pageRelation$;
    }

    createPage(parentPageId: string = null): Promise<string> {
        return new CreatePageAction(
            parentPageId,
            this.pageIdentityStorage,
            this.pageBodyStorage,
            this.pageRelationStorage,
            this.guid,
            this.wallModelFactory
        ).execute();
    }

    removePage(pageId: string): Promise<any> {
        return new RemovePageAction(
            pageId,
            this.pageIdentityStorage,
            this.pageBodyStorage,
            this.pageRelationStorage,
            this.wallModelFactory
        ).execute().then(() => {
            (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
        });
    }

    updatePageIdentity(identityPage: Partial<IIdentityPage>): Promise<Partial<IIdentityPage>> {
        return this.pageIdentityStorage.update(identityPage.id, identityPage);
    }

    updatePageBody(bodyPage: Partial<IBodyPage>): Promise<Partial<IBodyPage>> {
        return this.pageBodyStorage.update(bodyPage.id, bodyPage);
    }
}
