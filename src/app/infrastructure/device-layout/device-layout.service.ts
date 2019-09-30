import {MediaMatcher} from '@angular/cdk/layout';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeviceLayoutService {
    isNarrowLayout$: Observable<Boolean> = new Subject();
    isMediumLayout$: Observable<Boolean> = new Subject();
    isWideLayout$: Observable<Boolean> = new Subject();

    private mediumQuery: MediaQueryList;
    private narrowQuery: MediaQueryList;
    private wideQuery: MediaQueryList;

    constructor(media: MediaMatcher) {
        this.narrowQuery = media.matchMedia('(max-width: 600px)');
        this.mediumQuery = media.matchMedia('(min-width: 601px) and (max-width: 920px)');
        this.wideQuery = media.matchMedia('(min-width: 601px) and (max-width: 920px)');

        this.narrowQuery.addListener(() => {
            this.update();
        });

        this.mediumQuery.addListener(() => {
            this.update();
        });

        this.wideQuery.addListener(() => {
            this.update();
        });

        this.update();
    }

    isNarrowLayout(): Boolean {
        return Boolean(this.narrowQuery.matches);
    }

    private update() {
        (this.isNarrowLayout$ as BehaviorSubject<Boolean>).next(this.narrowQuery.matches);
        (this.isMediumLayout$ as BehaviorSubject<Boolean>).next(this.mediumQuery.matches);
        (this.isWideLayout$ as BehaviorSubject<Boolean>).next(this.wideQuery.matches);
    }
}
