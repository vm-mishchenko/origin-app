import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WALL_FILE_UPLOADER} from 'ngx-wall';
import {GoogleSignModule} from '../../../features/google-sign/google-sign.module';
import {PageModule} from '../../../features/page';
import {OriginPageFileUploaderService} from './origin-page-file-uploader.service';
import {OriginPageService} from './origin-page.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        GoogleSignModule,
        PageModule
    ],
    providers: [
        OriginPageService,
        {
            provide: WALL_FILE_UPLOADER,
            useClass: OriginPageFileUploaderService
        }
    ]
})
export class OriginPageModule {
}
