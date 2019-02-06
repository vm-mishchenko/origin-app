import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
export class NavigationService {
    constructor(private router: Router) {
    }

    toHome() {
        this.router.navigate(['/']);
    }

    toPageHome() {
        this.router.navigate(['/page']);
    }

    toPage(id: string) {
        this.router.navigate([`/page/${id}`]);
    }
}
