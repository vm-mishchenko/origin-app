import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

// store selected page id
@Injectable()
export class OriginPageService {
    selectedPageId: string;
    selectedPageId$: Observable<string> = new BehaviorSubject<string>(null);

    setSelectedPageId(pageId: string) {
        this.selectedPageId = pageId;

        (this.selectedPageId$ as BehaviorSubject<string>).next(pageId);
    }
}
