import {WallModelFactory} from 'ngx-wall';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {PageStoragesService2} from '../page-storages.service2';

export class RemovePageFilesAction2 {
  constructor(private pageId: string,
              private pageStoragesService2: PageStoragesService2,
              private wallModelFactory: WallModelFactory,
              private pageFileUploaderService: PageFileUploaderService) {
  }

  execute(): Promise<any> {
    return this.pageStoragesService2.pageBodies.doc(this.pageId).snapshot().then((pageBodySnapshot) => {
      const wallModel = this.wallModelFactory.create({
        plan: pageBodySnapshot.data().body
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
