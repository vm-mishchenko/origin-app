import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {AuthService} from '../../../modules/auth';

@Injectable({
  providedIn: 'root'
})
export class PageStoragesService2 {
  constructor(@Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager,
              private authService: AuthService) {
    this.authService.signOut$.subscribe(() => {
      // user log out
      this.reset();
    });
  }

  reset() {
    // todo: somehow reset the data
  }
}
