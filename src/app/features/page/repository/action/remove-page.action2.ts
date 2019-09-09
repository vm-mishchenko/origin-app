import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {PageStoragesService2} from '../page-storages.service2';
import {RemovePageEntitiesAction2} from './remove-page-entities.action2';
import {RemovePageFilesAction2} from './remove-page-files.action2';

export class RemovePageAction2 {
  constructor(private pageId: string,
              private wallModelFactory: WallModelFactory,
              private pageFileUploaderService: PageFileUploaderService,
              private pageStoragesService2: PageStoragesService2,
  ) {
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
    return this.pageStoragesService2.pageRelations.doc(removedPageId).snapshot().then((pageRelationSnapshot) => {
      const childRemovePromises = pageRelationSnapshot.data().childrenPageId
        .map((childrenPageId) => this.removePageTreeEntities(childrenPageId));

      return Promise.all(childRemovePromises);
    }).then(() => {
      return (new RemovePageEntitiesAction2(
        removedPageId,
        this.pageStoragesService2
      )).execute();
    });
  }

  private removePageTreeFiles(rootPageId: string): Promise<any> {
    const removePageFilesAction = new RemovePageFilesAction2(
      rootPageId,
      this.pageStoragesService2,
      this.wallModelFactory,
      this.pageFileUploaderService);

    return removePageFilesAction
      .execute()
      .then(() => {
        return this.pageStoragesService2.pageRelations.doc(rootPageId).snapshot().then((pageRelationSnapshot) => {
          const childRemovePromises = pageRelationSnapshot.data().childrenPageId
            .map((childrenPageId) => this.removePageTreeFiles(childrenPageId));

          return Promise.all(childRemovePromises);
        });
      });
  }

  private updateParentPageBody(removedPageId: string): Promise<any> {
    return this.pageStoragesService2.pageRelations.doc(removedPageId).snapshot().then((pageRelationSnapshot) => {
      if (!pageRelationSnapshot.data().parentPageId) {
        return Promise.resolve();
      }

      return this.pageStoragesService2.pageBodies.doc(pageRelationSnapshot.data().parentPageId).snapshot()
        .then((parentBodySnapshot) => {
        const wallModel = this.wallModelFactory.create({plan: parentBodySnapshot.data().body});

        wallModel.api.core
          .filterBricks((brick) => brick.tag === PAGE_BRICK_TAG_NAME && brick.state.pageId === removedPageId)
          .forEach((pageBrick) => {
            wallModel.api.core.removeBrick(pageBrick.id);
          });

          return this.pageStoragesService2.pageBodies.doc(parentBodySnapshot.id).update({
          body: wallModel.api.core.getPlan()
        }).then(() => {
        });
      });
    });
  }

  private updateParentRelation(removedPageId: string): Promise<any> {
    return this.pageStoragesService2.pageRelations.doc(removedPageId).snapshot()
      .then((removedPageRelationSnapshot) => {
        if (!removedPageRelationSnapshot.data().parentPageId) {
          return Promise.resolve();
        }

        return this.pageStoragesService2.pageRelations.doc(removedPageRelationSnapshot.data().parentPageId).snapshot()
          .then((parentPageRelationSnapshot) => {
          // remove page from children
          const removedChildIndex = parentPageRelationSnapshot.data().childrenPageId.indexOf(removedPageId);

            return this.pageStoragesService2.pageRelations.doc(parentPageRelationSnapshot.id).update({
            childrenPageId: [
              ...parentPageRelationSnapshot.data().childrenPageId.slice(0, removedChildIndex),
              ...parentPageRelationSnapshot.data().childrenPageId.slice(removedChildIndex + 1)
            ]
          }).then(() => {
            // todo: find out why do I need this then? Without it Typescript throw the error
          });
        });
      });
  }
}
