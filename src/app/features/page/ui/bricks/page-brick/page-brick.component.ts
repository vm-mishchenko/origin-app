import {Component, Input, OnInit} from '@angular/core';
import {IOnWallStateChange} from 'ngx-wall';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {PageRepositoryService2} from '../../../repository/page-repository.service2';
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

    constructor(private pageRepositoryService2: PageRepositoryService2) {
        this.pageTitle$ = this.pageId$.pipe(
          switchMap((pageId) => {
              return this.pageRepositoryService2.selectPageIdentity(pageId).pipe(
                filter((pageIdentitySnapshot) => pageIdentitySnapshot.exists),
                map((pageIdentitySnapshot) => pageIdentitySnapshot.data().title)
              );
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
