import {Inject, Injectable} from '@angular/core';
import {DatabaseManager, DocSnapshot} from 'cinatabase';
import {Observable} from 'rxjs';
import {DATABASE_MANAGER} from '../../../infrastructure/storage/storage.module';

@Injectable({
  providedIn: 'root'
})
export class PageRepositoryService2 {
  constructor(@Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
  }

  selectPageIdentities() {
    return this.databaseManager.collection('page-identity').query().onSnapshot();
  }

  selectPageRelations() {
    return this.databaseManager.collection('page-relation').query().onSnapshot();
  }

  allPageIdentities() {
    return this.databaseManager.collection('page-identity').query().snapshot({source: 'remote'});
  }

  pageBody(pageId: string) {
    return this.databaseManager.collection('page-body').doc(pageId).snapshot();
  }

  selectPageIdentity(pageId: string) {
    return this.databaseManager.collection('page-identity').doc(pageId).onSnapshot();
  }

  selectPageBody(pageId: string): Observable<DocSnapshot> {
    return this.databaseManager.collection('page-body').doc(pageId).onSnapshot();
  }

  syncIdentityPage(pageId: string) {
    return this.databaseManager.collection('page-identity').doc(pageId).sync();
  }

  syncBodyPage(pageId: string) {
    return this.databaseManager.collection('page-body').doc(pageId).sync();
  }

  syncRelationPage(pageId: string) {
    return this.databaseManager.collection('page-relation').doc(pageId).sync();
  }

  syncRootPages() {
    const rootPagesQuery = this.databaseManager.collection('page-relation').query({
      parentPageId: null
    });

    return rootPagesQuery.sync().then(() => {
      return rootPagesQuery.snapshot().then((rootPagesQuerySnapshot) => {
        const pageIdentities = this.databaseManager.collection('page-identity');

        return Promise.all(rootPagesQuerySnapshot.data().map((docSnapshot) => {
          return pageIdentities.doc(docSnapshot.id).sync();
        }));
      });
    });
  }

  syncTreePageChildren(pageId: string) {
    this.databaseManager.collection('page-relation').doc(pageId).snapshot().then((pageRelationSnapshot) => {
      return Promise.all(pageRelationSnapshot.data().childrenPageId.map((childPageId) => {
        return Promise.all([
          this.syncIdentityPage(childPageId),
          this.syncRelationPage(childPageId),
        ]);
      }));
    });
  }

  sync() {
    // todo: when remote server is synced need to update all page collection
  }
}
