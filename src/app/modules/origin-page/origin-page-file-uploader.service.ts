import {Injectable} from '@angular/core';
import {IWallFileUploader, IWallFileUploaderResult} from 'ngx-wall';
import {AuthService} from '../auth';
import {PageFileUploaderService} from '../../features/page/repository';
import {OriginPageService} from './origin-page.service';

@Injectable()
export class OriginPageFileUploaderService implements IWallFileUploader {
    constructor(private googleSignService: AuthService,
                private originPageService: OriginPageService,
                private pageFileUploaderService: PageFileUploaderService) {
    }

    upload(brickId: string, file): Promise<IWallFileUploaderResult> {
        return this.pageFileUploaderService.upload(
            this.originPageService.selectedPageId,
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
