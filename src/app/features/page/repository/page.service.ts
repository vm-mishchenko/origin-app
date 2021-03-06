import {Injectable} from '@angular/core';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {Guid} from '../../../infrastructure/utils';
import {CreatePageAction2} from './action/create-page.action2';
import {MoveBricksAction2} from './action/move-bricks.action2';
import {MovePageAction2} from './action/move-page.action2';
import {RemovePageAction2} from './action/remove-page.action2';
import {RemovePagesAction2} from './action/remove-pages.action2';
import {DeletePageEvent} from './page-events.type';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService2} from './page-repository.service2';
import {PageStoragesService2} from './page-storages.service2';
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

    constructor(private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService,
                private pageRepositoryService2: PageRepositoryService2,
                private guid: Guid,
                private pageStoragesService2: PageStoragesService2) {
    }

    createPage2(parentPageId: string = null, options: ICreatePageOption = DEFAULT_CREATE_PAGE_OPTIONS): Promise<string> {
        return new CreatePageAction2(
          parentPageId,
          this.guid,
          this.wallModelFactory,
          options,
          this.pageStoragesService2
        ).execute();
    }

    movePage2(movedPageId: string, targetPageId: string = null): Promise<any> {
        return (new MovePageAction2(
          movedPageId,
          targetPageId,
          this.wallModelFactory,
          this.pageStoragesService2
        )).execute();
    }

    moveBricks2(sourcePageId: string, brickIds: string[], targetPageId: string): Promise<any> {
        return (new MoveBricksAction2(
          sourcePageId,
          brickIds,
          targetPageId,
          this.wallModelFactory,
          this.pageStoragesService2
        )).execute();
    }

    removePage2(pageId: string): Promise<any> {
        return new RemovePageAction2(
          pageId,
          this.wallModelFactory,
          this.pageFileUploaderService,
          this.pageStoragesService2
        ).execute().then(() => {
            (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
        });
    }

    // it's important to use this API vs iteration over removePage API
    removePages2(pageIds: string[]): Promise<any> {
        return new RemovePagesAction2(
          pageIds,
          this.wallModelFactory,
          this.pageFileUploaderService,
          this.pageStoragesService2
        ).execute().then(() => {
            pageIds.forEach((pageId) => {
                (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
            });
        });
    }

    updatePageIdentity2(pageIdentityId: string, title: string): Promise<any> {
        return this.pageStoragesService2.pageIdentities.doc(pageIdentityId).update({
            title
        });
    }

    updatePageBody2(bodyPageId: string, bodyPage: Partial<IBodyPage>): Promise<Partial<IBodyPage>> {
        return this.pageStoragesService2.pageBodies.doc(bodyPageId).update(bodyPage);
    }
}
