import {Injectable} from '@angular/core';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {Guid} from '../../infrastructure/utils';
import {CreatePageAction} from './action/create-page.action';
import {RemovePageAction} from './action/remove-page.action';
import {RemovePagesAction} from './action/remove-pages.action';
import {DeletePageEvent} from './page-events.type';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {IBodyPage, IIdentityPage} from './page.types';

@Injectable()
export class PageService {
    // todo - integrate to application event stream
    // todo - replace any type
    events$: Observable<any> = new Subject<any>();

    constructor(private pageStorages: PageStoragesService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory,
                private guid: Guid) {
    }

    createPage(parentPageId: string = null): Promise<string> {
        return new CreatePageAction(
            parentPageId,
            this.pageStorages.pageIdentityStorage,
            this.pageStorages.pageBodyStorage,
            this.pageStorages.pageRelationStorage,
            this.guid,
            this.wallModelFactory
        ).execute();
    }

    removePage(pageId: string): Promise<any> {
        // todo: deal with parallel page removing
        // it works incorrectly :(
        return new RemovePageAction(
            pageId,
            this.pageStorages.pageIdentityStorage,
            this.pageStorages.pageBodyStorage,
            this.pageStorages.pageRelationStorage,
            this.wallModelFactory
        ).execute().then(() => {
            (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
        });
    }

    // it's important to use this API vs iteration over removePage API
    removePages(pageIds: string[]): Promise<any> {
        return new RemovePagesAction(
            pageIds,
            this.pageStorages.pageIdentityStorage,
            this.pageStorages.pageBodyStorage,
            this.pageStorages.pageRelationStorage,
            this.wallModelFactory
        ).execute().then(() => {
            pageIds.forEach((pageId) => {
                (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
            });
        });
    }

    updatePageIdentity(identityPage: Partial<IIdentityPage>): Promise<Partial<IIdentityPage>> {
        return this.pageStorages.pageIdentityStorage.update(identityPage.id, identityPage);
    }

    updatePageBody(bodyPage: Partial<IBodyPage>): Promise<Partial<IBodyPage>> {
        return this.pageStorages.pageBodyStorage.update(bodyPage.id, bodyPage);
    }
}
