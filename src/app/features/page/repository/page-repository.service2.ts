import {Inject, Injectable} from '@angular/core';
import {DatabaseManager, IDocSnapshot} from 'cinatabase';
import {Observable} from 'rxjs';
import {DATABASE_MANAGER} from '../../../modules/storage/storage.module';
import {IPageBody, IPageIdentity, IPageRelation} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PageRepositoryService2 {
  private pageIdentities = this.databaseManager.collection<IPageIdentity>('page-identity');
  private pageBodies = this.databaseManager.collection<IPageBody>('page-body');
  private pageRelations = this.databaseManager.collection<IPageRelation>('page-relation');

  constructor(@Inject(DATABASE_MANAGER) private databaseManager: DatabaseManager) {
  }

  selectPageIdentities() {
    return this.pageIdentities.query().onSnapshot();
  }

  selectPageRelations() {
    return this.pageRelations.query().onSnapshot();
  }

  allPageIdentities() {
    return this.pageIdentities.query().snapshot({source: 'remote'});
  }

  pageIdentity(pageId: string) {
    return this.pageIdentities.doc(pageId).snapshot();
  }

  pageBody(pageId: string) {
    return this.pageBodies.doc(pageId).snapshot();
  }

  pageRelation(pageId: string) {
    return this.pageRelations.doc(pageId).snapshot();
  }

  selectPageIdentity(pageId: string) {
    return this.pageIdentities.doc(pageId).onSnapshot();
  }

  selectPageBody(pageId: string): Observable<IDocSnapshot<IPageBody>> {
    return this.pageBodies.doc(pageId).onSnapshot();
  }

  syncIdentityPage(pageId: string) {
    return this.pageIdentities.doc(pageId).sync();
  }

  syncBodyPage(pageId: string) {
    return this.databaseManager.collection('page-body').doc(pageId).sync();
  }

  syncRelationPage(pageId: string) {
    return this.pageRelations.doc(pageId).sync();
  }

  syncRootPages() {
    const rootPagesQuery = this.pageRelations.query({
      parentPageId: null
    });

    return rootPagesQuery.sync().then(() => {
      return rootPagesQuery.snapshot().then((rootPagesQuerySnapshot) => {
        return Promise.all(rootPagesQuerySnapshot.data().map((docSnapshot) => {
          return this.pageIdentities.doc(docSnapshot.id).sync();
        }));
      });
    });
  }

  syncPageChildrenIdentity(pageId: string) {
    this.pageRelations.doc(pageId).snapshot().then((pageRelationSnapshot) => {
      if (pageRelationSnapshot.exists) {
        return Promise.all(pageRelationSnapshot.data().childrenPageId.map((childPageId) => {
          return Promise.all([
            this.syncIdentityPage(childPageId),
            this.syncRelationPage(childPageId)
          ]);
        }));
      }
    });
  }

  syncRecursiveParentPages(pageId: string) {
    return Promise.all([
      this.syncIdentityPage(pageId),
      this.syncRelationPage(pageId)
    ]).then(() => {
      return this.pageRelation(pageId).then((pageRelationSnapshot) => {
        if (pageRelationSnapshot.exists && pageRelationSnapshot.data().parentPageId) {
          return this.syncRecursiveParentPages(pageRelationSnapshot.data().parentPageId);
        }
      });
    });
  }
}
