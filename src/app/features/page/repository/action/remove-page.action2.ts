import {DatabaseManager} from 'cinatabase';
import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {RemovePageEntitiesAction2} from './remove-page-entities.action2';
import {RemovePageFilesAction2} from './remove-page-files.action2';

export class RemovePageAction2 {
  constructor(private pageId: string,
              private wallModelFactory: WallModelFactory,
              private pageFileUploaderService: PageFileUploaderService,
              private database: DatabaseManager,
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
    return this.database.collection('page-relation').doc(removedPageId).snapshot().then((pageRelationSnapshot) => {
      const childRemovePromises = pageRelationSnapshot.data().childrenPageId
        .map((childrenPageId) => this.removePageTreeEntities(childrenPageId));

      return Promise.all(childRemovePromises);
    }).then(() => {
      return (new RemovePageEntitiesAction2(
        removedPageId,
        this.database
      )).execute();
    });
  }

  private removePageTreeFiles(rootPageId: string): Promise<any> {
    const removePageFilesAction = new RemovePageFilesAction2(
      rootPageId,
      this.database,
      this.wallModelFactory,
      this.pageFileUploaderService);

    return removePageFilesAction
      .execute()
      .then(() => {
        return this.database.collection('page-relation').doc(rootPageId).snapshot().then((pageRelationSnapshot) => {
          const childRemovePromises = pageRelationSnapshot.data().childrenPageId
            .map((childrenPageId) => this.removePageTreeFiles(childrenPageId));

          return Promise.all(childRemovePromises);
        });
      });
  }

  private updateParentPageBody(removedPageId: string): Promise<any> {
    const pageRelations = this.database.collection('page-relation');

    return pageRelations.doc(removedPageId).snapshot().then((pageRelationSnapshot) => {
      if (!pageRelationSnapshot.data().parentPageId) {
        return Promise.resolve();
      }

      const pageBodies = this.database.collection('page-body');

      return pageBodies.doc(pageRelationSnapshot.data().parentPageId).snapshot().then((parentBodySnapshot) => {
        const wallModel = this.wallModelFactory.create({plan: parentBodySnapshot.data().body});

        wallModel.api.core
          .filterBricks((brick) => brick.tag === PAGE_BRICK_TAG_NAME && brick.state.pageId === removedPageId)
          .forEach((pageBrick) => {
            wallModel.api.core.removeBrick(pageBrick.id);
          });

        return pageBodies.doc(parentBodySnapshot.id).update({
          body: wallModel.api.core.getPlan()
        }).then(() => {
        });
      });
    });
  }

  private updateParentRelation(removedPageId: string): Promise<any> {
    const pageRelations = this.database.collection('page-relation');

    return pageRelations.doc(removedPageId).snapshot()
      .then((removedPageRelationSnapshot) => {
        if (!removedPageRelationSnapshot.data().parentPageId) {
          return Promise.resolve();
        }

        return pageRelations.doc(removedPageRelationSnapshot.data().parentPageId).snapshot().then((parentPageRelationSnapshot) => {
          // remove page from children
          const removedChildIndex = parentPageRelationSnapshot.data().childrenPageId.indexOf(removedPageId);

          return pageRelations.doc(parentPageRelationSnapshot.id).update({
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
