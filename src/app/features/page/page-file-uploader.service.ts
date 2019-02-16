import {Injectable} from '@angular/core';
import {IWallFileUploaderResult, WallModelFactory} from 'ngx-wall';
import {FirebaseFileUploaderService} from '../../infrastructure/firebase-file-uploader/firebase-file-uploader.service';
import {Guid} from '../../infrastructure/utils';
import {PageRepositoryService} from './page-repository.service';
import {IBodyPage} from './page.types';

type IUploadPathPreProcessor = (path: string) => string;

@Injectable()
export class PageFileUploaderService {
    uploadPathPreProcessor: IUploadPathPreProcessor[] = [];

    constructor(private guid: Guid, private firebaseFileUploader: FirebaseFileUploaderService,
                private pageRepositoryService: PageRepositoryService,
                private wallModelFactory: WallModelFactory) {
    }

    upload(pageId: string, brickId: string, file, preProcessor?: IUploadPathPreProcessor): Promise<IWallFileUploaderResult> {
        return this.pageRepositoryService.getBodyPage(pageId).then((bodyPage: IBodyPage) => {
            const wallModel = this.wallModelFactory.create({plan: bodyPage.body});

            const brickTag = wallModel.api.core.getBrickTag(brickId);

            let path = `${pageId}/${brickTag}/${brickId}/${this.guid.generate()}`;

            // execute local pre processors
            if (preProcessor) {
                path = preProcessor(path);
            }

            // execute global pre processors
            this.uploadPathPreProcessor.forEach((currentProcessor) => {
                path = currentProcessor(path);
            });

            return this.firebaseFileUploader.upload(path, file).then((downloadURL) => {
                return {
                    path,
                    downloadURL
                };
            });
        });
    }

    // extension point for modifying path
    // works for global settings
    // upload service take single preprocessor for individual path modification
    registerUploadPreProcessor(processor: IUploadPathPreProcessor) {
        this.uploadPathPreProcessor.push(processor);
    }

    remove(path: string): Promise<any> {
        return this.firebaseFileUploader.remove(path);
    }
}
