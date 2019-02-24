import {Injectable} from '@angular/core';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {Guid} from '../../infrastructure/utils';
import {PAGE_BRICK_TAG_NAME} from '../page-ui/page-ui.constant';
import {CreatePageAction} from './action/create-page.action';
import {MovePageAction} from './action/move-page.action';
import {RemovePageAction} from './action/remove-page.action';
import {RemovePagesAction} from './action/remove-pages.action';
import {DeletePageEvent} from './page-events.type';
import {PageFileUploaderService} from './page-file-uploader.service';
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
                private pageFileUploaderService: PageFileUploaderService,
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
        if (sourcePageId === targetPageId) {
            return Promise.resolve();
        }

        return Promise.all([
            this.pageRepositoryService.getBodyPage(sourcePageId),
            this.pageRepositoryService.getBodyPage(targetPageId)
        ]).then(([sourcePageBody, targetPageBody]) => {
            const sourcePageWallModel = this.wallModelFactory.create({plan: sourcePageBody.body});
            const targetPageWallModel = this.wallModelFactory.create({plan: targetPageBody.body});
            const brickSnapshots = brickIds.map((brickId) => {
                return sourcePageWallModel.api.core.getBrickSnapshot(brickId);
            });

            // process non page bricks
            brickSnapshots
                .filter((brickSnapshot) => brickSnapshot.tag !== PAGE_BRICK_TAG_NAME)
                .reverse()
                .forEach((nonPageBrickSnapshot) => {
                    sourcePageWallModel.api.core.removeBrick(nonPageBrickSnapshot.id);
                    targetPageWallModel.api.core.addBrickAtStart(nonPageBrickSnapshot.tag, nonPageBrickSnapshot.state);
                });

            // process page bricks
            const movePagePromises = brickSnapshots
                .filter((brickSnapshot) => brickSnapshot.tag === PAGE_BRICK_TAG_NAME)
                .map((brickSnapshot) => this.movePage(brickSnapshot.state.pageId, targetPageId));

            return Promise.all([
                this.updatePageBody({
                    id: sourcePageBody.id,
                    body: sourcePageWallModel.api.core.getPlan()
                }),
                this.updatePageBody({
                    id: targetPageBody.id,
                    body: targetPageWallModel.api.core.getPlan()
                }),
                ...movePagePromises
            ]);
        });
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
