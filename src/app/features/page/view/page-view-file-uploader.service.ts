import {Injectable} from '@angular/core';
import {IWallFileUploader, IWallFileUploaderResult} from 'ngx-wall';
import {AuthService} from '../../../modules/auth';
import {PageViewQuery} from './state/page-view.query';
import {PageFileUploaderService} from '../repository';

@Injectable()
export class PageViewFileUploaderService implements IWallFileUploader {
    constructor(private googleSignService: AuthService,
                private pageViewQuery: PageViewQuery,
                private pageFileUploaderService: PageFileUploaderService) {
    }

    upload(brickId: string, file): Promise<IWallFileUploaderResult> {
        return this.pageFileUploaderService.upload(
            this.pageViewQuery.getSelectedPageId(),
            brickId,
            file,
            (path) => `${this.googleSignService.user.uid}/${path}`
        );
    }

    remove(path: string): Promise<any> {
        return this.pageFileUploaderService.remove(path);
    }

    canUploadFile(): boolean {
        return this.googleSignService.isSignInGapiSync();
    }
}
