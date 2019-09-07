import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {Guid} from '../../../infrastructure/utils';
import {CreatePageAction} from './action/create-page.action';
import {CreatePageAction2} from './action/create-page.action2';
import {MoveBricksAction} from './action/move-bricks.action';
import {MovePageAction} from './action/move-page.action';
import {MovePageAction2} from './action/move-page.action2';
import {RemovePageAction} from './action/remove-page.action';
import {RemovePageAction2} from './action/remove-page.action2';
import {RemovePagesAction} from './action/remove-pages.action';
import {RemovePagesAction2} from './action/remove-pages.action2';
import {DeletePageEvent} from './page-events.type';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService} from './page-repository.service';
import {PageStoragesService} from './page-storages.service';
import {IBodyPage} from './page.types';

export interface ICreatePageOption {
    pageBrickId: string;
}

const DEFAULT_CREATE_PAGE_OPTIONS: ICreatePageOption = {
    pageBrickId: null
};

/**
 * I cannot add couple pages in parallel :(
 * There is the same problem as with removing several pages in one call
 */
@Injectable({
    providedIn: 'root'
})
export class PageService {
    // todo - integrate to application event stream
    // todo - replace any type
    events$: Observable<any> = new Subject<any>();

    constructor(private pageStorages: PageStoragesService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService,
                private guid: Guid,
                @Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
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

    createPage2(parentPageId: string = null, options: ICreatePageOption = DEFAULT_CREATE_PAGE_OPTIONS): Promise<string> {
        return new CreatePageAction2(
          parentPageId,
          this.guid,
          this.wallModelFactory,
          options,
          this.databaseManager
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

    movePage2(movedPageId: string, targetPageId: string = null): Promise<any> {
        return (new MovePageAction2(
          movedPageId,
          targetPageId,
          this.wallModelFactory,
          this.databaseManager
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

    removePage2(pageId: string): Promise<any> {
        return new RemovePageAction2(
          pageId,
          this.wallModelFactory,
          this.pageFileUploaderService,
          this.databaseManager
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

    // it's important to use this API vs iteration over removePage API
    removePages2(pageIds: string[]): Promise<any> {
        return new RemovePagesAction2(
          pageIds,
          this.wallModelFactory,
          this.pageFileUploaderService,
          this.databaseManager
        ).execute().then(() => {
            pageIds.forEach((pageId) => {
                (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
            });
        });
    }

    updatePageIdentity2(pageIdentityId: string, title: string): Promise<any> {
        return this.databaseManager.collection('page-identity').doc(pageIdentityId).update({
            title
        });
    }

    updatePageBody(bodyPage: Partial<IBodyPage>): Promise<Partial<IBodyPage>> {
        return this.pageStorages.pageBodyStorage.update(bodyPage.id, bodyPage);
    }

    updatePageBody2(bodyPageId: string, bodyPage: Partial<IBodyPage>): Promise<Partial<IBodyPage>> {
        return this.databaseManager.collection('page-body').doc(bodyPageId).update(bodyPage);
    }
}
