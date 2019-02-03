import {async, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {PouchdbStorageFactory} from '../../infrastructure/pouchdb-storage';
import {PageModule} from './page.module';
import {PageService} from './page.service';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

class TestScope {
    service: PageService;

    initialize() {
        const pouchDbStorageFactory: PouchdbStorageFactory = TestBed.get(PouchdbStorageFactory);

        // add test prefix for easier identifying test databases
        pouchDbStorageFactory.setDatabaseNamePrefix('test');

        this.service = TestBed.get(PageService);
    }

    cleanUp(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.service.pageIdentity$.subscribe((pageIdentities) => {
                Promise.all(Object.values(pageIdentities).map((pageIdentity) => {
                    return this.service.removePage(pageIdentity.id);
                })).then(resolve, reject);
            });
        });
    }
}

describe('PageService', () => {
    let testScope: TestScope;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [PageModule]
    }));

    beforeEach(() => {
        testScope = new TestScope();
        testScope.initialize();
    });

    afterEach((done) => {
        testScope.cleanUp().then(done);
        testScope = null;
    });

    it('should be created', () => {
        const service: PageService = TestBed.get(PageService);
        expect(service).toBeTruthy();
    });

    describe('Create page', () => {
        it('should return created page id', async(() => {
            testScope.service.createPage().then((id) => {
                expect(id).toBeDefined();
            });
        }));

        it('should create page identity, body', fakeAsync(() => {
            let pageIdentity: IIdentityPage = null;
            let pageBody: IBodyPage = null;

            testScope.service.createPage().then((id) => {
                testScope.service.pageIdentity$.subscribe((pages) => {
                    pageIdentity = pages[id];
                });

                testScope.service.pageBody$.subscribe((pages) => {
                    pageBody = pages[id];
                });

                flushMicrotasks();
                // tick() - we might tick as well. Tick is needed when I wanna wait for
                // particular time in setTimeout
                // https://www.joshmorony.com/testing-asynchronous-code-with-fakeasync-in-angular

                // async without flushMicrotasks or tick do the same

                expect(pageIdentity).toBeDefined();
                expect(pageBody).toBeDefined();
            });
        }));

        it('should create page relation', fakeAsync(() => {
            let pageRelation: IRelationPage = null;

            testScope.service.createPage().then((id) => {
                testScope.service.pageRelation$.subscribe((pages) => {
                    pageRelation = pages[id];
                });

                flushMicrotasks();
                expect(pageRelation).toBeDefined();
            });
        }));

        it('should create page relation', fakeAsync(() => {
            let pageRelation: IRelationPage = null;

            testScope.service.createPage().then((id) => {
                testScope.service.pageRelation$.subscribe((pages) => {
                    pageRelation = pages[id];
                });

                flushMicrotasks();
                expect(pageRelation).toBeDefined();

                expect(pageRelation.parentPageId).toBe(null);
                expect(pageRelation.childrenPageId.length).toBe(0);
            });
        }));

        it('should create child page', fakeAsync(() => {
            let pageIdentity: IIdentityPage = null;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.pageIdentity$.subscribe((pages) => {
                        pageIdentity = pages[childPageId];
                    });

                    flushMicrotasks();
                    expect(pageIdentity).toBeDefined();
                });
            });
        }));

        it('should create child page relation', fakeAsync(() => {
            let childPageRelation: IRelationPage = null;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.pageRelation$.subscribe((pages) => {
                        childPageRelation = pages[childPageId];
                    });

                    flushMicrotasks();
                    expect(childPageRelation.parentPageId).toBe(parentPageId);
                });
            });
        }));

        it('should update parent relation', fakeAsync(() => {
            let parentPageRelation: IRelationPage = null;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.pageRelation$.subscribe((pages) => {
                        parentPageRelation = pages[parentPageId];
                    });

                    flushMicrotasks();
                    expect(parentPageRelation.childrenPageId.length).toBe(1);
                    expect(parentPageRelation.childrenPageId[0]).toBe(childPageId);
                });
            });
        }));
    });
});
