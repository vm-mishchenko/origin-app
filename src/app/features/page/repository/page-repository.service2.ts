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

  pageIdentities() {
    return this.databaseManager.collection('page-identity').query().onSnapshot();
  }

  pageRelations() {
    return this.databaseManager.collection('page-relation').query().onSnapshot();
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

  loadRootPages() {
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
}
