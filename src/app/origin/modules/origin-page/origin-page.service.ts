import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {GoogleSignService} from '../../../features/google-sign/google-sign.service';
import {PageStoragesService} from '../../../features/page/page-storages.service';

// store selected page id
@Injectable()
export class OriginPageService {
    selectedPageId: string;
    selectedPageId$: Observable<string> = new BehaviorSubject<string>(null);

    constructor(private googleSignService: GoogleSignService,
                private pageStoragesService: PageStoragesService) {
        this.googleSignService.signOut$.subscribe(() => {
            // user log out
            this.pageStoragesService.reset();
        });
    }

    setSelectedPageId(pageId: string) {
        this.selectedPageId = pageId;

        (this.selectedPageId$ as BehaviorSubject<string>).next(pageId);
    }
}
