import {Injectable} from '@angular/core';
import {IWallFileUploaderResult, WallModelFactory} from 'ngx-wall';
import {FirebaseFileUploaderService} from '../../../infrastructure/firebase-file-uploader/firebase-file-uploader.service';
import {Guid} from '../../../infrastructure/utils';
import {PageRepositoryService} from './page-repository.service';
import {IBodyPage} from './page.types';

type IPathPreProcessor = (path: string) => string;

@Injectable({
    providedIn: 'root'
})
export class PageFileUploaderService {
    constructor(private guid: Guid, private firebaseFileUploader: FirebaseFileUploaderService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory) {
    }

    upload(pageId: string, brickId: string, file, preProcessor?: IPathPreProcessor): Promise<IWallFileUploaderResult> {
        return this.pageRepositoryService.getBodyPage(pageId).then((bodyPage: IBodyPage) => {
            const wallModel = this.wallModelFactory.create({plan: bodyPage.body});

            const brickTag = wallModel.api.core.getBrickTag(brickId);

            let path = `${pageId}/${brickTag}/${brickId}/${this.guid.generate()}`;

            // execute local pre processors
            if (preProcessor) {
                path = preProcessor(path);
            }

            return this.firebaseFileUploader.upload(path, file).then((downloadURL) => {
                return {
                    path,
                    downloadURL
                };
            });
        });
    }

    remove(path: string): Promise<any> {
        return this.firebaseFileUploader.remove(path);
    }
}
