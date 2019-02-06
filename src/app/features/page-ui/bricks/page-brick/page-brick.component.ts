import {Component, Input, OnInit} from '@angular/core';
import {IOnWallStateChange} from 'ngx-wall';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/internal/operators';
import {PageService} from '../../../page/page.service';
import {IPageBrickState} from './page-brick.types';

@Component({
    selector: 'app-page-brick',
    templateUrl: './page-brick.component.html',
    styleUrls: ['./page-brick.component.scss']
})
export class PageBrickComponent implements IOnWallStateChange, OnInit {
    @Input() state: IPageBrickState;

    pageTitle$: Observable<string>;
    pageId$: Observable<string> = new BehaviorSubject<string>('');

    constructor(private pageService: PageService) {
        this.pageTitle$ = combineLatest(
            this.pageId$,
            this.pageService.pageIdentity$,
        ).pipe(
            filter(([pageId]) => Boolean(pageId)),
            map(([pageId, pageIdentities]) => {
                return pageIdentities[pageId] ? pageIdentities[pageId].title : 'Unknown';
            })
        );
    }

    ngOnInit() {
        this.triggerCurrentPageId();
    }

    onWallStateChange() {
        this.triggerCurrentPageId();
    }

    private triggerCurrentPageId() {
        (this.pageId$ as BehaviorSubject<string>).next(this.state && this.state.pageId);
    }
}
