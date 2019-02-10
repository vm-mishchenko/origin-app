import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {PAGE_BRICK_TAG_NAME} from '../../page-ui/page-ui.constant';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';

export class RemovePageAction {
    constructor(private pageId: string,
                private pageIdentityStorage: PersistentStorage<IIdentityPage>,
                private pageBodyStorage: PersistentStorage<IBodyPage>,
                private pageRelationStorage: PersistentStorage<IRelationPage>,
                private wallModelFactory: WallModelFactory) {
    }

    execute(): Promise<any> {
        return Promise.all([
            this.updateParentRelationChildrenAfterRemove(this.pageId),
            this.updateParentPageBody(this.pageId),
            this.removePageWithChildren(this.pageId),
        ]);
    }

    private updateParentRelationChildrenAfterRemove(removedPageId: string): Promise<any> {
        return this.pageRelationStorage.get(removedPageId)
            .then((removedPageRelation) => {
                if (removedPageRelation.parentPageId) {
                    return this.pageRelationStorage.get(removedPageRelation.parentPageId).then((parentPageRelation) => {
                        // remove page from children
                        const removedChildIndex = parentPageRelation.childrenPageId.indexOf(removedPageId);

                        return this.pageRelationStorage.update(parentPageRelation.id, {
                            childrenPageId: [
                                ...parentPageRelation.childrenPageId.slice(0, removedChildIndex),
                                ...parentPageRelation.childrenPageId.slice(removedChildIndex + 1)
                            ]
                        }).then(() => {
                            // todo: find out why do I need this then? Without it Typescript throw the error
                        });
                    });
                } else {
                    return Promise.resolve();
                }
            });
    }

    private removePageWithChildren(removedPageId: string): Promise<any> {
        const removeChildPages = this.pageRelationStorage.get(removedPageId).then((pageRelation) => {
            return pageRelation.childrenPageId.map((childrenPageId) => this.removePageWithChildren(childrenPageId));
        });

        return Promise.all([
            removeChildPages,
            this.pageIdentityStorage.remove(removedPageId),
            this.pageBodyStorage.remove(removedPageId),
            this.pageRelationStorage.remove(removedPageId),
        ]);
    }

    private updateParentPageBody(removedPageId: string): Promise<any> {
        return this.pageRelationStorage.get(removedPageId).then((pageRelation) => {
            if (!pageRelation.parentPageId) {
                return Promise.resolve();
            }

            return this.pageBodyStorage.get(pageRelation.parentPageId).then((parentBody) => {
                const wallModel = this.wallModelFactory.create({plan: parentBody.body});

                wallModel.api.core
                    .filterBricks((brick) => brick.tag === PAGE_BRICK_TAG_NAME && brick.state.pageId === removedPageId)
                    .forEach((pageBrick) => {
                        wallModel.api.core.removeBrick(pageBrick.id);
                    });

                return this.pageBodyStorage.update(parentBody.id, {
                    body: wallModel.api.core.getPlan()
                }).then(() => {
                });
            });
        });
    }
}
