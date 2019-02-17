import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {PAGE_BRICK_TAG_NAME} from '../../page-ui/page-ui.constant';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';
import {RemovePageEntitiesAction} from './remove-page-entities.action';
import {RemovePageFilesAction} from './remove-page-files.action';

export class RemoveSiblingsPageAction {
    constructor(private pageIds: string[],
                private pageIdentityStorage: PersistentStorage<IIdentityPage>,
                private pageBodyStorage: PersistentStorage<IBodyPage>,
                private pageRelationStorage: PersistentStorage<IRelationPage>,
                private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService) {
    }

    execute(): Promise<any> {
        return Promise.all([
            this.updateParentRelation(),
            this.updateParentPageBody(),
            this.removePageTreeFiles(this.pageIds).then(() =>
                this.removePageTreeEntities(this.pageIds))
        ]);
    }

    /*
    * First remove deeper child page entities
    * Last remove top level page entities
    * */
    private removePageTreeEntities(pageIds: string[]): Promise<any> {
        const removePromises = pageIds.map((removedPageId) => {
            return this.pageRelationStorage.get(removedPageId).then((pageRelation) => {
                return this.removePageTreeEntities(pageRelation.childrenPageId);
            }).then(() => {
                return (new RemovePageEntitiesAction(
                    removedPageId,
                    this.pageIdentityStorage,
                    this.pageBodyStorage,
                    this.pageRelationStorage
                )).execute();
            });
        });

        return Promise.all(removePromises);
    }

    private removePageTreeFiles(pageIds: string[]): Promise<any> {
        const removePromises = pageIds.map((pageId) => {
            const removePageFilesAction = new RemovePageFilesAction(
                pageId,
                this.pageBodyStorage,
                this.wallModelFactory,
                this.pageFileUploaderService);

            return removePageFilesAction
                .execute()
                .then(() => {
                    return this.pageRelationStorage.get(pageId).then((pageRelation) => {
                        return this.removePageTreeFiles(pageRelation.childrenPageId);
                    });
                });
        });

        return Promise.all(removePromises);
    }

    private updateParentRelation(): Promise<any> {
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

