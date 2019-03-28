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
        console.log(`to page home`);
        
        this.router.navigate(['/page']);
    }

    toPage(id: string) {
        console.log(`to page`);

        this.router.navigate([`/page/${id}`]);
    }
}
