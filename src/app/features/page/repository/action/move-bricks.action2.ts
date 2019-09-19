import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageStoragesService2} from '../page-storages.service2';
import {MovePageAction2} from './move-page.action2';

export class MoveBricksAction2 {
  constructor(
    private sourcePageId: string,
    private brickIds: string[],
    private targetPageId: string,
    private wallModelFactory: WallModelFactory,
    private pageStoragesService2: PageStoragesService2
  ) {
  }

  execute(): Promise<any> {
    if (this.sourcePageId === this.targetPageId) {
      return Promise.resolve();
    }

    return Promise.all([
      this.pageStoragesService2.pageBodies.doc(this.sourcePageId).snapshot(),
      this.pageStoragesService2.pageBodies.doc(this.targetPageId).snapshot()
    ]).then(([sourcePageBodySnapshot, targetPageBodySnapshot]) => {
      const sourcePageWallModel = this.wallModelFactory.create({plan: sourcePageBodySnapshot.data().body});
      const targetPageWallModel = this.wallModelFactory.create({plan: targetPageBodySnapshot.data().body});
      const brickSnapshots = this.brickIds.map((brickId) => {
        return sourcePageWallModel.api.core2.getBrickSnapshot(brickId);
      });

      // process non page bricks
      brickSnapshots
        .filter((brickSnapshot) => brickSnapshot.tag !== PAGE_BRICK_TAG_NAME)
        .reverse()
        .forEach((nonPageBrickSnapshot) => {
          sourcePageWallModel.api.core2.removeBrick(nonPageBrickSnapshot.id);
          targetPageWallModel.api.core2.addBrickAtStart(nonPageBrickSnapshot.tag, nonPageBrickSnapshot.state);
        });

      return Promise.all([
        this.pageStoragesService2.pageBodies.doc(sourcePageBodySnapshot.id).update({body: sourcePageWallModel.api.core2.getPlan()}),
        this.pageStoragesService2.pageBodies.doc(targetPageBodySnapshot.id).update({body: targetPageWallModel.api.core2.getPlan()})
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
              this.pageStoragesService2
            )).execute();
          });
        }, Promise.resolve());
      });
    });
  }
}
