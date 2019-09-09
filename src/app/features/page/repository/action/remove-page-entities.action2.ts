import {PageStoragesService2} from '../page-storages.service2';

export class RemovePageEntitiesAction2 {
  constructor(
    private pageId: string,
    private pageStoragesService2: PageStoragesService2,
  ) {
  }

  execute(): Promise<any> {
    return Promise.all([
      this.pageStoragesService2.pageIdentities.doc(this.pageId).remove(),
      this.pageStoragesService2.pageBodies.doc(this.pageId).remove(),
      this.pageStoragesService2.pageRelations.doc(this.pageId).remove(),
    ]);
  }
}
