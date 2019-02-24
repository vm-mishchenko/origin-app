import {Injectable} from '@angular/core';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {Guid} from '../../infrastructure/utils';
import {PAGE_BRICK_TAG_NAME} from '../page-ui/page-ui.constant';
import {CreatePageAction} from './action/create-page.action';
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
        // cannot move page inside itself
        if (movedPageId === targetPageId) {
            return Promise.resolve();
        }

        return this.pageRepositoryService.getRelationPage(movedPageId).then((movedRelationPage) => {
            // moved page already at the top
            if (targetPageId === null) {
                if (movedRelationPage.parentPageId === null) {
                    return Promise.resolve();
                }
            }

            return this.pageRepositoryService.getRelationPage(targetPageId).then((targetRelationPage) => {
                // moved page already in target page
                if (movedRelationPage.parentPageId === targetRelationPage.id) {
                    return Promise.resolve();
                }

                return this.pageRepositoryService.getBodyPage(targetPageId).then((targetPageBodyPage) => {
                    const targetParentPromises = [];
                    // update new parent body
                    // todo: duplicated code
                    const targetWallModel = this.wallModelFactory.create({plan: targetPageBodyPage.body});
                    targetWallModel.api.core.addBrickAtStart(PAGE_BRICK_TAG_NAME, {pageId: movedPageId});

                    targetParentPromises.push(
                        this.pageStorages.pageBodyStorage.update(targetPageBodyPage.id, {
                            body: targetWallModel.api.core.getPlan()
                        })
                    );

                    // update new parent relation
                    targetParentPromises.push(
                        this.pageStorages.pageRelationStorage.update(targetRelationPage.id, {
                            childrenPageId: [
                                ...targetRelationPage.childrenPageId,
                                movedPageId
                            ]
                        })
                    );

                    // update moved page parent id
                    targetParentPromises.push(
                        this.pageStorages.pageRelationStorage.update(movedRelationPage.id, {
                            parentPageId: targetPageId
                        })
                    );

                    return Promise.all(targetParentPromises).then(() => {
                        // if moved page was at the root level then
                        // there is no need to update old parent page
                        if (movedRelationPage.parentPageId === null) {
                            return Promise.resolve();
                        }

                        // update old parent page
                        return Promise.all([
                            this.pageRepositoryService.getRelationPage(movedRelationPage.parentPageId),
                            this.pageRepositoryService.getBodyPage(movedRelationPage.parentPageId)
                        ]).then(([oldPageRelationPage, oldPageBodyPage]) => {
                            const promises = [];

                            // update old parent relation
                            const movedPageChildIndex = oldPageRelationPage.childrenPageId.indexOf(movedPageId);
                            oldPageRelationPage.childrenPageId.splice(movedPageChildIndex, 1);

                            promises.push(
                                this.pageStorages.pageRelationStorage.update(oldPageRelationPage.id, {
                                    childrenPageId: oldPageRelationPage.childrenPageId
                                })
                            );

                            // update old parent body
                            // todo: duplicated code
                            const oldWallModel = this.wallModelFactory.create({plan: oldPageBodyPage.body});
                            oldWallModel.api.core
                                .filterBricks((brick) => brick.tag === PAGE_BRICK_TAG_NAME && brick.state.pageId === movedPageId)
                                .forEach((pageBrick) => {
                                    oldWallModel.api.core.removeBrick(pageBrick.id);
                                });

                            promises.push(
                                this.pageStorages.pageBodyStorage.update(oldPageBodyPage.id, {
                                    body: oldWallModel.api.core.getPlan()
                                })
                            );

                            return Promise.all(promises).then(() => {
                            });
                        });
                    });
                });
            });
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
