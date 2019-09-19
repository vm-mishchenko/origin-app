import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageStoragesService2} from '../page-storages.service2';

export class MovePageAction2 {
  constructor(private movedPageId: string,
              private targetPageId: string,
              private wallModelFactory: WallModelFactory,
              private pageStoragesService2: PageStoragesService2,
  ) {
  }

  execute(): Promise<any> {
    // cannot move page inside itself
    if (this.movedPageId === this.targetPageId) {
      return Promise.resolve();
    }

    const movedPageRelationDoc = this.pageStoragesService2.pageRelations.doc(this.movedPageId);

    return movedPageRelationDoc.snapshot().then((movedRelationPageSnapshot) => {
      // moved page already in target page
      if (movedRelationPageSnapshot.data().parentPageId === this.targetPageId) {
        return Promise.resolve();
      }

      // run guards
      return Promise.all([
        this.targetPageIsNotChildOfMovedPageGuard()
      ]).then(() => {
        return this.updateTargetPage()
          .then(() => this.updateMovedPage())
          .then(() => this.updateOldParentPage(movedRelationPageSnapshot.data().parentPageId));
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

    return this.pageStoragesService2.pageRelations.doc(this.targetPageId).snapshot().then((targetRelationPageSnapshot) => {
      return this.pageStoragesService2.pageBodies.doc(this.targetPageId).snapshot().then((targetPageBodyPageSnapshot) => {
        const targetParentPromises = [];
        // update new parent body-editor
        // todo: duplicated code
        const targetWallModel = this.wallModelFactory.create({plan: targetPageBodyPageSnapshot.data().body});
        targetWallModel.api.core2.addBrickAtStart(PAGE_BRICK_TAG_NAME, {pageId: this.movedPageId});

        targetParentPromises.push(
          this.pageStoragesService2.pageBodies.doc(targetPageBodyPageSnapshot.id).update({
            body: targetWallModel.api.core2.getPlan()
          })
        );

        // update new parent relation
        targetParentPromises.push(
          this.pageStoragesService2.pageRelations.doc(targetRelationPageSnapshot.id).update({
            childrenPageId: targetRelationPageSnapshot.data().childrenPageId.concat([this.movedPageId])
          })
        );

        return Promise.all(targetParentPromises);
      });
    });
  }

  private updateMovedPage(): Promise<any> {
    return this.pageStoragesService2.pageRelations.doc(this.movedPageId).update({
      parentPageId: this.targetPageId
    });
  }

  private updateOldParentPage(oldParentPageId: string): Promise<any> {
    if (oldParentPageId === null) {
      return Promise.resolve();
    }

    // update old parent page
    return Promise.all([
      this.pageStoragesService2.pageRelations.doc(oldParentPageId).snapshot(),
      this.pageStoragesService2.pageBodies.doc(oldParentPageId).snapshot()
    ]).then(([oldPageRelationPageSnapshot, oldPageBodyPageSnapshot]) => {
      const promises = [];

      // update old parent relation
      const movedPageChildIndex = oldPageRelationPageSnapshot.data().childrenPageId.indexOf(this.movedPageId);
      promises.push(
        this.pageStoragesService2.pageRelations.doc(oldPageRelationPageSnapshot.id).update({
          childrenPageId: [
            ...oldPageRelationPageSnapshot.data().childrenPageId.slice(0, movedPageChildIndex),
            ...oldPageRelationPageSnapshot.data().childrenPageId.slice(movedPageChildIndex + 1),
          ]
        })
      );

      // update old parent body-editor
      // todo: duplicated code
      const oldWallModel = this.wallModelFactory.create({plan: oldPageBodyPageSnapshot.data().body});
      oldWallModel.api.core
        .filterBricks((brick) => brick.tag === PAGE_BRICK_TAG_NAME && brick.state.pageId === this.movedPageId)
        .forEach((pageBrick) => {
          oldWallModel.api.core2.removeBrick(pageBrick.id);
        });

      promises.push(
        this.pageStoragesService2.pageBodies.doc(oldPageBodyPageSnapshot.id).update({
          body: oldWallModel.api.core2.getPlan()
        })
      );

      return Promise.all(promises).then(() => {
      });
    });
  }

  // guards
  private targetPageIsNotChildOfMovedPageGuard(pageId: string = this.targetPageId): Promise<any> {
    return this.pageStoragesService2.pageRelations.doc(pageId).snapshot().then((targetRelationSnapshot) => {
      if (!targetRelationSnapshot.data().parentPageId) {
        return Promise.resolve();
      }

      if (targetRelationSnapshot.data().parentPageId === this.movedPageId) {
        return Promise.reject('Forbidden operation');
      }

      // lets look above, maybe somewhere there will be moved page
      if (targetRelationSnapshot.data().parentPageId) {
        return this.targetPageIsNotChildOfMovedPageGuard(targetRelationSnapshot.data().parentPageId);
      }
    });
  }
}
