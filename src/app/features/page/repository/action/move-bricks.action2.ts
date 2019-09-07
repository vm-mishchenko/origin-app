import {DatabaseManager} from 'cinatabase';
import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {MovePageAction2} from './move-page.action2';

export class MoveBricksAction2 {
  constructor(
    private sourcePageId: string,
    private brickIds: string[],
    private targetPageId: string,
    private wallModelFactory: WallModelFactory,
    private database: DatabaseManager,
  ) {
  }

  execute(): Promise<any> {
    if (this.sourcePageId === this.targetPageId) {
      return Promise.resolve();
    }

    const pageBodies = this.database.collection('page-body');

    return Promise.all([
      pageBodies.doc(this.sourcePageId).snapshot(),
      pageBodies.doc(this.targetPageId).snapshot(),
    ]).then(([sourcePageBodySnapshot, targetPageBodySnapshot]) => {
      const sourcePageWallModel = this.wallModelFactory.create({plan: sourcePageBodySnapshot.data().body});
      const targetPageWallModel = this.wallModelFactory.create({plan: targetPageBodySnapshot.data().body});
      const brickSnapshots = this.brickIds.map((brickId) => {
        return sourcePageWallModel.api.core.getBrickSnapshot(brickId);
      });

      // process non page bricks
      brickSnapshots
        .filter((brickSnapshot) => brickSnapshot.tag !== PAGE_BRICK_TAG_NAME)
        .reverse()
        .forEach((nonPageBrickSnapshot) => {
          sourcePageWallModel.api.core.removeBrick(nonPageBrickSnapshot.id);
          targetPageWallModel.api.core.addBrickAtStart(nonPageBrickSnapshot.tag, nonPageBrickSnapshot.state);
        });

      return Promise.all([
        pageBodies.doc(sourcePageBodySnapshot.id).update({body: sourcePageWallModel.api.core.getPlan()}),
        pageBodies.doc(targetPageBodySnapshot.id).update({body: targetPageWallModel.api.core.getPlan()})
      ]).then(() => {
        const pageBrickSnapshots = brickSnapshots
          .filter((brickSnapshot) => brickSnapshot.tag === PAGE_BRICK_TAG_NAME);

        // move page in series, parallel moving leads to race condition
        return pageBrickSnapshots.reduce((result, pageBrickSnapshot) => {
          return result.then(() => {
            return (new MovePageAction2(
              pageBrickSnapshot.state.pageId,
              this.targetPageId,
              this.wallModelFactory,
              this.database
            )).execute();
          });
        }, Promise.resolve());
      });
    });
  }
}
