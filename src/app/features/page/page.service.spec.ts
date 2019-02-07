import {async, fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {PouchdbStorageFactory} from '../../infrastructure/pouchdb-storage';
import {PageModule} from './page.module';
import {PageService} from './page.service';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

class TestScope {
    service: PageService;

    initialize() {
        const persistentStorageFactory: PersistentStorageFactory = TestBed.get(PersistentStorageFactory);
        persistentStorageFactory.setOptions({pouchDbSavingDebounceTime: 0});

        this.service = TestBed.get(PageService);
    }
}

class MockPouchDb {
    put() {
        return Promise.resolve();
    }

    get() {
        return Promise.resolve({});
    }

    remove() {
        return Promise.resolve();
    }
}

fdescribe('PageService', () => {
    const mockPouchDb = new MockPouchDb();
    let testScope: TestScope;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [PageModule],
        providers: [
            {
                provide: PouchdbStorageFactory,
                useValue: {
                    createPouchDB: () => mockPouchDb
                }
            }
        ]
    }));

    beforeEach(() => {
        testScope = new TestScope();
        testScope.initialize();
    });

    afterEach(() => {
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
                expect(pageRelation.parentPageId).toBe(null);
                expect(pageRelation.childrenPageId.length).toBe(0);
            });
        }));

        it('should create child page', async(() => {
            let pageIdentity: IIdentityPage = null;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.pageIdentity$.subscribe((pages) => {
                        pageIdentity = pages[childPageId];
                    });

                    expect(pageIdentity).toBeDefined();
                });
            });
        }));

        it('should create child page relation', async(() => {
            let childPageRelation: IRelationPage = null;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.pageRelation$.subscribe((pages) => {
                        childPageRelation = pages[childPageId];
                    });

                    expect(childPageRelation.parentPageId).toBe(parentPageId);
                });
            });
        }));

        it('should update parent relation', fakeAsync(() => {
            let parentPageRelation: IRelationPage = null;

            let childPageId: string;
            let parentPageId: string;

            testScope.service.createPage().then((parentPageId_) => parentPageId = parentPageId_);
            tick();

            testScope.service.createPage(parentPageId).then((childPageId_) => childPageId = childPageId_);
            tick();

            testScope.service.pageRelation$.subscribe((pages) => {
                parentPageRelation = pages[parentPageId];
            });

            flushMicrotasks();
            expect(parentPageRelation.childrenPageId.length).toBe(1);
            expect(parentPageRelation.childrenPageId[0]).toBe(childPageId);
        }));
    });

    describe('Delete page', () => {
        it('should delete page identity, body, relation', async(() => {
            let pageIdentity;
            let pageBody;
            let pageRelation;

            testScope.service.createPage().then((pageId) => {
                testScope.service.removePage(pageId).then(() => {
                    testScope.service.pageIdentity$.subscribe((pages) => {
                        pageIdentity = pages[pageId];
                    });

                    testScope.service.pageBody$.subscribe((pages) => {
                        pageBody = pages[pageId];
                    });

                    testScope.service.pageRelation$.subscribe((pages) => {
                        pageRelation = pages[pageId];
                    });

                    expect(pageIdentity).not.toBeDefined();
                    expect(pageBody).not.toBeDefined();
                    expect(pageRelation).not.toBeDefined();
                });
            });
        }));

        it('should delete child page identity, body, relation', async(() => {
            let childPageIdentity;
            let childPageBody;
            let childPageRelation;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.removePage(parentPageId).then(() => {
                        testScope.service.pageIdentity$.subscribe((pages) => {
                            childPageIdentity = pages[childPageId];
                        });

                        testScope.service.pageBody$.subscribe((pages) => {
                            childPageBody = pages[childPageId];
                        });

                        testScope.service.pageRelation$.subscribe((pages) => {
                            childPageRelation = pages[childPageId];
                        });

                        expect(childPageIdentity).not.toBeDefined();
                        expect(childPageBody).not.toBeDefined();
                        expect(childPageRelation).not.toBeDefined();
                    });
                });
            });
        }));

        it('should delete all sub child page identity, body, relation', async(() => {
            let subChildPageIdentity;
            let subChildPageBody;
            let subChildPageRelation;

            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.createPage(childPageId).then((subChildPageId) => {
                        testScope.service.removePage(parentPageId).then(() => {
                            testScope.service.pageIdentity$.subscribe((pages) => {
                                subChildPageIdentity = pages[subChildPageId];
                            });

                            testScope.service.pageBody$.subscribe((pages) => {
                                subChildPageBody = pages[subChildPageId];
                            });

                            testScope.service.pageRelation$.subscribe((pages) => {
                                subChildPageRelation = pages[subChildPageId];
                            });

                            expect(subChildPageIdentity).not.toBeDefined();
                            expect(subChildPageBody).not.toBeDefined();
                            expect(subChildPageRelation).not.toBeDefined();
                        });
                    });
                });
            });
        }));
    });
});
