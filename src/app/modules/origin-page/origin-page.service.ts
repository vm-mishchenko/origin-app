import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthService} from '../auth';
import {PageStoragesService} from '../../features/page/repository/page-storages.service';

// state selected page id
@Injectable()
export class OriginPageService {
    selectedPageId: string;
    selectedPageId$: Observable<string> = new BehaviorSubject<string>(null);

    constructor(private googleSignService: AuthService,
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
