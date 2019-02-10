import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {PAGE_BRICK_TAG_NAME} from '../../page-ui/page-ui.constant';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';

export class RemoveSiblingsPageAction {
    constructor(private pageIds: string[],
                private pageIdentityStorage: PersistentStorage<IIdentityPage>,
                private pageBodyStorage: PersistentStorage<IBodyPage>,
                private pageRelationStorage: PersistentStorage<IRelationPage>,
                private wallModelFactory: WallModelFactory) {
    }

    execute(): Promise<any> {
        return Promise.all([
            this.updateParentRelationChildrenAfterRemove(),
            this.updateParentPageBody(),
            this.removePageWithChildren(this.pageIds),
        ]);
    }

    private updateParentRelationChildrenAfterRemove(): Promise<any> {
        return this.pageRelationStorage.get(this.pageIds[0])
            .then((removedPageRelation) => {
                if (!removedPageRelation.parentPageId) {
                    throw new Error('Siblings page ids supposed to have common parent');
                }

                return this.pageRelationStorage.get(removedPageRelation.parentPageId).then((parentPageRelation) => {
                    const parentChildrenPageId = parentPageRelation.childrenPageId.slice(0);

                    // remove page from children
                    this.pageIds.forEach((removedPageId) => {
                        const removedChildIndex = parentChildrenPageId.indexOf(removedPageId);

                        parentChildrenPageId.splice(removedChildIndex, 1);
                    });

                    return this.pageRelationStorage.update(parentPageRelation.id, {
                        childrenPageId: parentChildrenPageId
                    });
                });
            });
    }

    private removePageWithChildren(pageIds: string[]): Promise<any> {
        return Promise.all(
            pageIds.map((removedPageId) => {
                const removeChildPages = this.pageRelationStorage.get(removedPageId).then((pageRelation) => {
                    return this.removePageWithChildren(pageRelation.childrenPageId);
                });

                return Promise.all([
                    removeChildPages,
                    this.pageIdentityStorage.remove(removedPageId),
                    this.pageBodyStorage.remove(removedPageId),
                    this.pageRelationStorage.remove(removedPageId),
                ]);
            })
        );
    }

    private updateParentPageBody(): Promise<any> {
        return this.pageRelationStorage.get(this.pageIds[0]).then((removedPageRelation) => {
            if (!removedPageRelation.parentPageId) {
                throw new Error('Siblings page ids supposed to have common parent');
            }

            return this.pageBodyStorage.get(removedPageRelation.parentPageId).then((parentBody) => {
                const wallModel = this.wallModelFactory.create({plan: parentBody.body});

                wallModel.api.core.filterBricks((brick) => {
                    return brick.tag === PAGE_BRICK_TAG_NAME && this.pageIds.includes(brick.state.pageId);
                }).forEach((pageBrick) => {
                    wallModel.api.core.removeBrick(pageBrick.id);
                });

                return this.pageBodyStorage.update(parentBody.id, {
                    body: wallModel.api.core.getPlan()
                });
            });
        });
    }
}
