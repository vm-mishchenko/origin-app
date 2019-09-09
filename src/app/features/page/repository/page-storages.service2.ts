import {Inject, Injectable} from '@angular/core';
import {DatabaseManager} from 'cinatabase';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';
import {IPageBody, IPageIdentity, IPageRelation} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PageStoragesService2 {
  pageIdentities = this.databaseManager.collection<IPageIdentity>('page-identity');
  pageBodies = this.databaseManager.collection<IPageBody>('page-body');
  pageRelations = this.databaseManager.collection<IPageRelation>('page-relation');

  constructor(@Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
  }
}
