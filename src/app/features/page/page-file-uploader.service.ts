import {Injectable} from '@angular/core';
import {IWallFileUploader, IWallFileUploaderResult} from 'ngx-wall';
import {FirebaseFileUploaderService} from '../../infrastructure/firebase-file-uploader/firebase-file-uploader.service';
import {Guid} from '../../infrastructure/utils';

type IUploadPathPreProcessor = (path: string) => string;

@Injectable()
export class PageFileUploaderService implements IWallFileUploader {
    uploadPathPreProcessor: IUploadPathPreProcessor[] = [];

    constructor(private guid: Guid, private firebaseFileUploader: FirebaseFileUploaderService) {

    }

    upload(brickId: string, file): Promise<IWallFileUploaderResult> {
        let path = `${brickId}/${this.guid.generate()}`;

        this.uploadPathPreProcessor.forEach((processor) => {
            path = processor(path);
        });

        return this.firebaseFileUploader.upload(path, file).then((downloadURL) => {
            return {
                path,
                downloadURL
            };
        });
    }

    // extension point for modifying path
    // userId or selectedPage id might be added
    registerUploadPreProcessor(processor: IUploadPathPreProcessor) {
        this.uploadPathPreProcessor.push(processor);
    }

    remove(path: string): Promise<any> {
        return this.firebaseFileUploader.remove(path);
    }

    // todo: need to define extension point for it
    canUploadFile(): boolean {
        return true;
    }
}
