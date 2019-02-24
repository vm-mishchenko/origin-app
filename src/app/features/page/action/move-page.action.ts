import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../page-ui/page-ui.constant';
import {PageRepositoryService} from '../page-repository.service';
import {PageStoragesService} from '../page-storages.service';

export class MovePageAction {
    constructor(private movedPageId: string,
                private targetPageId: string,
                private pageStorages: PageStoragesService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory,
    ) {

    }

    execute(): Promise<any> {
        // cannot move page inside itself
        if (this.movedPageId === this.targetPageId) {
            return Promise.resolve();
        }

        return this.pageRepositoryService.getRelationPage(this.movedPageId).then((movedRelationPage) => {
            // moved page already at the top
            if (this.targetPageId === null) {
                if (movedRelationPage.parentPageId === null) {
                    return Promise.resolve();
                }
            }

            return this.pageRepositoryService.getRelationPage(this.targetPageId).then((targetRelationPage) => {
                // moved page already in target page
                if (movedRelationPage.parentPageId === targetRelationPage.id) {
                    return Promise.resolve();
                }

                return this.pageRepositoryService.getBodyPage(this.targetPageId).then((targetPageBodyPage) => {
                    const targetParentPromises = [];
                    // update new parent body
                    // todo: duplicated code
                    const targetWallModel = this.wallModelFactory.create({plan: targetPageBodyPage.body});
                    targetWallModel.api.core.addBrickAtStart(PAGE_BRICK_TAG_NAME, {pageId: this.movedPageId});

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
                                this.movedPageId
                            ]
                        })
                    );

                    // update moved page parent id
                    targetParentPromises.push(
                        this.pageStorages.pageRelationStorage.update(movedRelationPage.id, {
                            parentPageId: this.targetPageId
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
                            const movedPageChildIndex = oldPageRelationPage.childrenPageId.indexOf(this.movedPageId);
                            promises.push(
                                this.pageStorages.pageRelationStorage.update(oldPageRelationPage.id, {
                                    childrenPageId: [
                                        ...oldPageRelationPage.childrenPageId.slice(0, movedPageChildIndex),
                                        ...oldPageRelationPage.childrenPageId.slice(movedPageChildIndex + 1),
                                    ]
                                })
                            );

                            // update old parent body
                            // todo: duplicated code
                            const oldWallModel = this.wallModelFactory.create({plan: oldPageBodyPage.body});
                            oldWallModel.api.core
                                .filterBricks((brick) => brick.tag === PAGE_BRICK_TAG_NAME && brick.state.pageId === this.movedPageId)
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
}
