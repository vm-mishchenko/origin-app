import {DatabaseManager} from 'cinatabase';
import {WallModelFactory} from 'ngx-wall';
import {PageFileUploaderService} from '../page-file-uploader.service';

export class RemovePageFilesAction2 {
  constructor(private pageId: string,
              private database: DatabaseManager,
              private wallModelFactory: WallModelFactory,
              private pageFileUploaderService: PageFileUploaderService) {
  }

  execute(): Promise<any> {
    return this.database.collection('page-body').doc(this.pageId).snapshot().then((pageBodySnapshot) => {
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
