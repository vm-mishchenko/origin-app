import {WallModelFactory} from 'ngx-wall';
import {Guid} from '../../../../infrastructure/utils';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageStoragesService2} from '../page-storages.service2';
import {ICreatePageOption} from '../page.service';

export class CreatePageAction2 {
  constructor(
    private parentPageId: string = null,
    private guid: Guid,
    private wallModelFactory: WallModelFactory,
    private options: ICreatePageOption,
    private pageStoragesService2: PageStoragesService2,
  ) {
  }

  execute(): Promise<string> {
    const newPageId = this.guid.generate();
    const pageIdentityDoc = this.pageStoragesService2.pageIdentities.doc(newPageId);
    const pageBodyDoc = this.pageStoragesService2.pageBodies.doc(newPageId);
    const pageRelationDoc = this.pageStoragesService2.pageRelations.doc(newPageId);

    /* If parent exists we should update parent relations as well */
    const updateParentPageRelation = new Promise((resolve, reject) => {
      if (!this.parentPageId) {
        resolve();
        return;
      }

      const parentRelationDoc = this.pageStoragesService2.pageRelations.doc(this.parentPageId);

      parentRelationDoc.snapshot()
        .then((parentRelationSnapshot) => {
          return parentRelationDoc.update({
            childrenPageId: [
              ...parentRelationSnapshot.data().childrenPageId,
              newPageId
            ]
          });
        })
        .then(resolve, reject);
    });

    const updateParentPageBody = new Promise((resolve, reject) => {
      if (!this.parentPageId) {
        resolve();
        return;
      }

      const parentBodyDoc = this.pageStoragesService2.pageBodies.doc(this.parentPageId);

      parentBodyDoc.snapshot().then((parentBodyDocSnapshot) => {
        const wallModel = this.wallModelFactory.create({plan: parentBodyDocSnapshot.data().body});

        if (this.options.pageBrickId) {
          wallModel.api.core.updateBrickState(this.options.pageBrickId, {
            pageId: newPageId
          });
        } else {
          wallModel.api.core.addBrickAtStart(PAGE_BRICK_TAG_NAME, {pageId: newPageId});
        }

        parentBodyDoc.update({
          body: wallModel.api.core.getPlan()
        }).then(resolve, reject);
      });
    });

    return Promise.all([
      updateParentPageBody,
      updateParentPageRelation,
      pageIdentityDoc.set({
        title: 'Default title'
      }),
      pageBodyDoc.set({
        body: this.wallModelFactory.create().api.core.getPlan()
      }),
      pageRelationDoc.set({
        parentPageId: this.parentPageId,
        childrenPageId: []
      })
    ]).then(() => newPageId);
  }
}
