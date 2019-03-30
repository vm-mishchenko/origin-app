import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
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
            // moved page already in target page
            if (movedRelationPage.parentPageId === this.targetPageId) {
                return Promise.resolve();
            }

            // run guards
            return Promise.all([
                this.targetPageIsNotChildOfMovedPageGuard()
            ]).then(() => {
                return this.updateTargetPage()
                    .then(() => this.updateMovedPage())
                    .then(() => this.updateOldParentPage(movedRelationPage.parentPageId));
            }).catch(() => {
                // catch some inconsistency
                // skip all operations
                return Promise.resolve();
            });
        });
    }

    private updateTargetPage(): Promise<any> {
        if (this.targetPageId === null) {
            return Promise.resolve();
        }

        return this.pageRepositoryService.getRelationPage(this.targetPageId).then((targetRelationPage) => {
            return this.pageRepositoryService.getBodyPage(this.targetPageId).then((targetPageBodyPage) => {
                const targetParentPromises = [];
                // update new parent body-editor
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
                        childrenPageId: targetRelationPage.childrenPageId.concat([this.movedPageId])
                    })
                );

                return Promise.all(targetParentPromises);
            });
        });
    }

    private updateMovedPage(): Promise<any> {
        return this.pageStorages.pageRelationStorage.update(this.movedPageId, {
            parentPageId: this.targetPageId
        });
    }

    private updateOldParentPage(oldParentPageId: string): Promise<any> {
        if (oldParentPageId === null) {
            return Promise.resolve();
        }

        // update old parent page
        return Promise.all([
            this.pageRepositoryService.getRelationPage(oldParentPageId),
            this.pageRepositoryService.getBodyPage(oldParentPageId)
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

            // update old parent body-editor
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
    }

    // guards
    private targetPageIsNotChildOfMovedPageGuard(pageId: string = this.targetPageId): Promise<any> {
        return this.pageRepositoryService.getRelationPage(pageId).then((targetRelation) => {
            if (!targetRelation.parentPageId) {
                return Promise.resolve();
            }

            if (targetRelation.parentPageId === this.movedPageId) {
                return Promise.reject('Forbidden operation');
            }

            // lets look above, maybe somewhere there will be moved page
            if (targetRelation.parentPageId) {
                return this.targetPageIsNotChildOfMovedPageGuard(targetRelation.parentPageId);
            }
        });
    }
}
