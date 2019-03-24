import {WallModelFactory} from 'ngx-wall';
import {PAGE_BRICK_TAG_NAME} from '../../ui/page-ui.constant';
import {PageRepositoryService} from '../page-repository.service';
import {PageStoragesService} from '../page-storages.service';
import {MovePageAction} from './move-page.action';

export class MoveBricksAction {
    constructor(
        private sourcePageId: string,
        private brickIds: string[],
        private targetPageId: string,
        private pageRepositoryService: PageRepositoryService,
        private wallModelFactory: WallModelFactory,
        private pageStorages: PageStoragesService
    ) {
    }

    execute(): Promise<any> {
        if (this.sourcePageId === this.targetPageId) {
            return Promise.resolve();
        }

        return Promise.all([
            this.pageRepositoryService.getBodyPage(this.sourcePageId),
            this.pageRepositoryService.getBodyPage(this.targetPageId)
        ]).then(([sourcePageBody, targetPageBody]) => {
            const sourcePageWallModel = this.wallModelFactory.create({plan: sourcePageBody.body});
            const targetPageWallModel = this.wallModelFactory.create({plan: targetPageBody.body});
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
                this.pageStorages.pageBodyStorage.update(sourcePageBody.id, {body: sourcePageWallModel.api.core.getPlan()}),
                this.pageStorages.pageBodyStorage.update(targetPageBody.id, {body: targetPageWallModel.api.core.getPlan()})
            ]).then(() => {
                const pageBrickSnapshots = brickSnapshots
                    .filter((brickSnapshot) => brickSnapshot.tag === PAGE_BRICK_TAG_NAME);

                // move page in series, parallel moving leads to race condition
                return pageBrickSnapshots.reduce((result, pageBrickSnapshot) => {
                    return result.then(() => {
                        return (new MovePageAction(
                            pageBrickSnapshot.state.pageId,
                            this.targetPageId,
                            this.pageStorages,
                            this.pageRepositoryService,
                            this.wallModelFactory
                        )).execute();
                    });
                }, Promise.resolve());
            });
        });
    }
}
