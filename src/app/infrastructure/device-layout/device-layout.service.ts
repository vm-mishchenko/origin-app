import {Injectable} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeviceLayoutService {
    mobileLayout$: Observable<Boolean> = new BehaviorSubject(false);
    private mobileQuery: MediaQueryList;

    constructor(media: MediaMatcher) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');

        this.mobileQuery.addListener(() => {
            this.updateMobileLayoutValue();
        });

        if (this.mobileQuery.matches) {
            this.updateMobileLayoutValue();
        }
    }

    isMobileLayout(): Boolean {
        return Boolean(this.mobileQuery.matches);
    }

    private updateMobileLayoutValue() {
        (this.mobileLayout$ as BehaviorSubject<Boolean>).next(this.mobileQuery.matches);
    }
}
