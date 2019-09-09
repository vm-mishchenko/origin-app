import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    constructor(private router: Router) {
    }

    toHome() {
        this.router.navigate(['/']);
    }

    toSettings() {
        this.router.navigate(['/settings']);
    }

    toPageHome() {
        this.router.navigate(['/page']);
    }

    toPage(id: string) {
        this.router.navigate([`/page/${id}`]);
    }

    toSearch() {
        this.router.navigate(['/page/search']);
    }
}
