import {Injectable} from '@angular/core';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {Guid} from '../../infrastructure/utils';
import {CreatePageAction} from './action/create-page.action';
import {MoveBricksAction} from './action/move-bricks.action';
import {MovePageAction} from './action/move-page.action';
import {RemovePageAction} from './action/remove-page.action';
import {RemovePagesAction} from './action/remove-pages.action';
import {DeletePageEvent} from './page-events.type';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {IBodyPage, IIdentityPage} from './page.types';

export interface ICreatePageOption {
    pageBrickId: string;
}

const DEFAULT_CREATE_PAGE_OPTIONS: ICreatePageOption = {
    pageBrickId: null
};

/**
 * I cannot add couple pages in parallel :(
 * There is the same problem as with removing several pages in one call
 * */
@Injectable()
export class PageService {
    // todo - integrate to application event stream
    // todo - replace any type
    events$: Observable<any> = new Subject<any>();

    constructor(private pageStorages: PageStoragesService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService,
                private guid: Guid) {
    }

    createPage(parentPageId: string = null, options: ICreatePageOption = DEFAULT_CREATE_PAGE_OPTIONS): Promise<string> {
        return new CreatePageAction(
            parentPageId,
            this.pageStorages.pageIdentityStorage,
            this.pageStorages.pageBodyStorage,
            this.pageStorages.pageRelationStorage,
            this.guid,
            this.wallModelFactory,
            options
        ).execute();
    }

    movePage(movedPageId: string, targetPageId: string = null): Promise<any> {
        return (new MovePageAction(
            movedPageId,
            targetPageId,
            this.pageStorages,
            this.pageRepositoryService,
            this.wallModelFactory
        )).execute();
    }

    moveBricks(sourcePageId: string, brickIds: string[], targetPageId: string): Promise<any> {
        return (new MoveBricksAction(
            sourcePageId,
            brickIds,
            targetPageId,
            this.pageRepositoryService,
            this.wallModelFactory,
            this.pageStorages
        )).execute();
    }

    removePage(pageId: string): Promise<any> {
        return new RemovePageAction(
            pageId,
            this.pageStorages.pageIdentityStorage,
            this.pageStorages.pageBodyStorage,
            this.pageStorages.pageRelationStorage,
            this.wallModelFactory,
            this.pageFileUploaderService
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
            this.wallModelFactory,
            this.pageFileUploaderService
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
