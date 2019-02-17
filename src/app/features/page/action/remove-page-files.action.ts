import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {IBodyPage} from '../page.types';

export class RemovePageFilesAction {
    constructor(private pageId: string,
                private pageBodyStorage: PersistentStorage<IBodyPage>,
                private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService) {
    }

    execute(): Promise<any> {
        return this.pageBodyStorage.get(this.pageId).then((pageBody) => {
            const wallModel = this.wallModelFactory.create({
                plan: pageBody.body
            });

            const pageResources = wallModel.api.core.getBrickIds().reduce((result, brickId) => {
                result = result.concat(wallModel.api.core.getBrickResourcePaths(brickId));

                return result;
            }, []);

            return Promise.all(
                pageResources.map((filePath) => this.pageFileUploaderService.remove(filePath))
            );
        });
    }
}
