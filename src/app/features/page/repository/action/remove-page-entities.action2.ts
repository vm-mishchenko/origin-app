import {DatabaseManager} from 'cinatabase';

export class RemovePageEntitiesAction2 {
  constructor(
    private pageId: string,
    private database: DatabaseManager
  ) {
  }

  execute(): Promise<any> {
    return Promise.all([
      this.database.collection('page-identity').doc(this.pageId).remove(),
      this.database.collection('page-body').doc(this.pageId).remove(),
      this.database.collection('page-relation').doc(this.pageId).remove(),
    ]);
  }
}
