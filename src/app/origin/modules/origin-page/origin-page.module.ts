import {NgModule} from '@angular/core';
import {WALL_FILE_UPLOADER} from 'ngx-wall';
import {GoogleSignModule} from '../../../features/google-sign/google-sign.module';
import {PageModule} from '../../../features/page/repository';
import {OriginPageFileUploaderService} from './origin-page-file-uploader.service';
import {OriginPageService} from './origin-page.service';

@NgModule({
    declarations: [],
    imports: [
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
