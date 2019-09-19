import {Injectable} from '@angular/core';
import {IWallFileUploaderResult, WallModelFactory} from 'ngx-wall';
import {FirebaseFileUploaderService} from '../../../infrastructure/firebase-file-uploader/firebase-file-uploader.service';
import {Guid} from '../../../infrastructure/utils';
import {PageRepositoryService2} from './page-repository.service2';

type IPathPreProcessor = (path: string) => string;

@Injectable({
    providedIn: 'root'
})
export class PageFileUploaderService {
    constructor(private guid: Guid, private firebaseFileUploader: FirebaseFileUploaderService,
                private pageRepositoryService2: PageRepositoryService2,
                private wallModelFactory: WallModelFactory) {
    }

    upload(pageId: string, brickId: string, file, preProcessor?: IPathPreProcessor): Promise<IWallFileUploaderResult> {
        return this.pageRepositoryService2.pageBody(pageId).then((bodyPageSnapshot) => {
            const wallModel = this.wallModelFactory.create({plan: bodyPageSnapshot.data().body});

            const brickTag = wallModel.api.core2.getBrickTag(brickId);

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
