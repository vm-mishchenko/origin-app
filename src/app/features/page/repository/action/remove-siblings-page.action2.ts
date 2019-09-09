import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {PageStoragesService2} from '../page-storages.service2';
import {RemovePageEntitiesAction2} from './remove-page-entities.action2';
import {RemovePageFilesAction2} from './remove-page-files.action2';

export class RemoveSiblingsPageAction2 {
  constructor(private pageIds: string[],
              private wallModelFactory: WallModelFactory,
              private pageFileUploaderService: PageFileUploaderService,
              private pageStoragesService2: PageStoragesService2,) {
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
      return this.pageStoragesService2.pageRelations.doc(removedPageId).snapshot().then((pageRelationSnapshot) => {
        return this.removePageTreeEntities(pageRelationSnapshot.data().childrenPageId);
      }).then(() => {
        return (new RemovePageEntitiesAction2(
          removedPageId,
          this.pageStoragesService2
        )).execute();
      });
    });

    return Promise.all(removePromises);
  }

  private removePageTreeFiles(pageIds: string[]): Promise<any> {
    const removePromises = pageIds.map((pageId) => {
      const removePageFilesAction = new RemovePageFilesAction2(
        pageId,
        this.pageStoragesService2,
        this.wallModelFactory,
        this.pageFileUploaderService);

      return removePageFilesAction
        .execute()
        .then(() => {
          return this.pageStoragesService2.pageRelations.doc(pageId).snapshot().then((pageRelationSnapshot) => {
            return this.removePageTreeFiles(pageRelationSnapshot.data().childrenPageId);
          });
        });
    });

    return Promise.all(removePromises);
  }

  private updateParentRelation(): Promise<any> {
    return this.pageStoragesService2.pageRelations.doc(this.pageIds[0]).snapshot()
      .then((removedPageRelationSnapshot) => {
        if (!removedPageRelationSnapshot.data().parentPageId) {
          throw new Error('Siblings page ids supposed to have common parent');
        }

        return this.pageStoragesService2.pageRelations.doc(removedPageRelationSnapshot.data().parentPageId).snapshot()
          .then((parentPageRelationSnapshot) => {
          const parentChildrenPageId = parentPageRelationSnapshot.data().childrenPageId.slice(0);

          // remove page from children
          this.pageIds.forEach((removedPageId) => {
            const removedChildIndex = parentChildrenPageId.indexOf(removedPageId);

            parentChildrenPageId.splice(removedChildIndex, 1);
          });

            return this.pageStoragesService2.pageRelations.doc(parentPageRelationSnapshot.id).update({
            childrenPageId: parentChildrenPageId
          });
        });
      });
  }

  private updateParentPageBody(): Promise<any> {
    return this.pageStoragesService2.pageRelations.doc(this.pageIds[0]).snapshot().then((removedPageRelationSnapshot) => {
      if (!removedPageRelationSnapshot.data().parentPageId) {
        throw new Error('Siblings page ids supposed to have common parent');
      }

      return this.pageStoragesService2.pageBodies.doc(removedPageRelationSnapshot.data().parentPageId).snapshot()
        .then((parentBodySnapshot) => {
        const wallModel = this.wallModelFactory.create({plan: parentBodySnapshot.data().body});

        wallModel.api.core.filterBricks((brick) => {
          return brick.tag === PAGE_BRICK_TAG_NAME && this.pageIds.includes(brick.state.pageId);
        }).forEach((pageBrick) => {
          wallModel.api.core.removeBrick(pageBrick.id);
        });

          return this.pageStoragesService2.pageBodies.doc(parentBodySnapshot.id).update({
          body: wallModel.api.core.getPlan()
        });
      });
    });
  }
}

