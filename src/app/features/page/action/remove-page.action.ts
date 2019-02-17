import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {PAGE_BRICK_TAG_NAME} from '../../page-ui/page-ui.constant';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';
import {RemovePageEntitiesAction} from './remove-page-entities.action';
import {RemovePageFilesAction} from './remove-page-files.action';

export class RemovePageAction {
    constructor(private pageId: string,
                private pageIdentityStorage: PersistentStorage<IIdentityPage>,
                private pageBodyStorage: PersistentStorage<IBodyPage>,
                private pageRelationStorage: PersistentStorage<IRelationPage>,
                private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService) {
    }

    /*
    * remove page entities
    * remove page files
    * remove child entities
    * remove child files
    *
    * Removing files is critical operation. Unsuccessful operation may leave
    * dead files in the storage which will take place and will not be shown in UI.
    *
    * 1. Find all children bodies
    * 2. Store all reference to file in persistent storage
    * 3. Iterate over files and delete them
    * */
    execute(): Promise<any> {
        return Promise.all([
            this.updateParentRelation(this.pageId),
            this.updateParentPageBody(this.pageId),
            this.removePageTreeFiles(this.pageId)
                .then(() => this.removePageTreeEntities(this.pageId))
        ]);
    }

    private removePageTreeEntities(removedPageId: string): Promise<any> {
        return this.pageRelationStorage.get(removedPageId).then((pageRelation) => {
            const childRemovePromises = pageRelation.childrenPageId
                .map((childrenPageId) => this.removePageTreeEntities(childrenPageId));

            return Promise.all(childRemovePromises);
        }).then(() => {
            return (new RemovePageEntitiesAction(
                removedPageId,
                this.pageIdentityStorage,
                this.pageBodyStorage,
                this.pageRelationStorage
            )).execute();
        });
    }

    private removePageTreeFiles(rootPageId: string): Promise<any> {
        const removePageFilesAction = new RemovePageFilesAction(
            rootPageId,
            this.pageBodyStorage,
            this.wallModelFactory,
            this.pageFileUploaderService);

        return removePageFilesAction
            .execute()
            .then(() => {
                return this.pageRelationStorage.get(rootPageId).then((pageRelation) => {
                    const childRemovePromises = pageRelation.childrenPageId
                        .map((childrenPageId) => this.removePageTreeFiles(childrenPageId));

                    return Promise.all(childRemovePromises);
                });
            });
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

    private updateParentRelation(removedPageId: string): Promise<any> {
        return this.pageRelationStorage.get(removedPageId)
            .then((removedPageRelation) => {
                if (!removedPageRelation.parentPageId) {
                    return Promise.resolve();
                }

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
            });
    }
}
