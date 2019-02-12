import {async, fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {BrickRegistry, IBrickSnapshot, IWallDefinition, IWallModel, WallModelFactory} from 'ngx-wall';
import {PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {PouchdbStorageFactory} from '../../infrastructure/pouchdb/pouchdb-storage';
import {PAGE_BRICK_TAG_NAME} from '../page-ui/page-ui.constant';
import {PageBrickComponent} from '../page-ui/bricks/page-brick/page-brick.component';
import {PageRepositoryService} from './page-repository.service';
import {PageModule} from './page.module';
import {PageService} from './page.service';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

class TestScope {
    service: PageService;
    pageRepositoryService: PageRepositoryService;

    initialize() {
        const persistentStorageFactory: PersistentStorageFactory = TestBed.get(PersistentStorageFactory);
        persistentStorageFactory.setOptions({pouchDbSavingDebounceTime: 0});

        this.service = TestBed.get(PageService);
        this.pageRepositoryService = TestBed.get(PageRepositoryService);

        const brickRegistry = TestBed.get(BrickRegistry);
        brickRegistry.register({
            tag: PAGE_BRICK_TAG_NAME,
            component: PageBrickComponent,
            name: 'Page',
            description: 'Embed a sub-page inside this page'
        });
    }

    createWallModel(plan: IWallDefinition): IWallModel {
        const wallModelFactory: WallModelFactory = TestBed.get(WallModelFactory);

        return wallModelFactory.create({plan});
    }

    findPageBrick(wallDefinition: IWallDefinition, pageId: string): IBrickSnapshot {
        const wallModel = this.createWallModel(wallDefinition);

        return wallModel.api.core.filterBricks((brick) => {
            return brick.tag === 'page' && brick.state.pageId === pageId;
        })[0];
    }

    hasPageEntities(pageId): Promise<boolean> {
        return Promise.all([
            this.pageRepositoryService.hasIdentityPage(pageId),
            this.pageRepositoryService.hasRelationPage(pageId),
            this.pageRepositoryService.hasBodyPage(pageId)
        ]).then(([hasIdentityPage, hasRelationPage, hasBodyPage]) => {
            return Boolean(hasIdentityPage && hasRelationPage && hasBodyPage);
        });
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

describe('PageService', () => {
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
                testScope.pageRepositoryService.pageIdentity$.subscribe((pages) => {
                    pageIdentity = pages[id];
                });

                testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
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
                testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
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
                    testScope.pageRepositoryService.pageIdentity$.subscribe((pages) => {
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
                    testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
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

            testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
                parentPageRelation = pages[parentPageId];
            });

            flushMicrotasks();
            expect(parentPageRelation.childrenPageId.length).toBe(1);
            expect(parentPageRelation.childrenPageId[0]).toBe(childPageId);
        }));

        it('should add page brick to parent body', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    let parentPageBody: IBodyPage;

                    testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
                        parentPageBody = pages[parentPageId];
                    });

                    expect(testScope.findPageBrick(parentPageBody.body, childPageId)).toBeDefined();
                });
            });
        }));
    });

    describe('Remove page', () => {
        it('should delete page identity, body, relation', async(() => {
            let pageIdentity;
            let pageBody;
            let pageRelation;

            testScope.service.createPage().then((pageId) => {
                testScope.service.removePage(pageId).then(() => {
                    testScope.pageRepositoryService.pageIdentity$.subscribe((pages) => {
                        pageIdentity = pages[pageId];
                    });

                    testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
                        pageBody = pages[pageId];
                    });

                    testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
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
                        testScope.pageRepositoryService.pageIdentity$.subscribe((pages) => {
                            childPageIdentity = pages[childPageId];
                        });

                        testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
                            childPageBody = pages[childPageId];
                        });

                        testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
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
                            testScope.pageRepositoryService.pageIdentity$.subscribe((pages) => {
                                subChildPageIdentity = pages[subChildPageId];
                            });

                            testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
                                subChildPageBody = pages[subChildPageId];
                            });

                            testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
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

        it('should update parent relation children', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    let parentPageRelation: IRelationPage;

                    testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
                        parentPageRelation = pages[parentPageId];
                    });

                    expect(parentPageRelation.childrenPageId.includes(childPageId)).toBeTruthy();

                    testScope.service.removePage(childPageId).then(() => {
                        testScope.pageRepositoryService.pageRelation$.subscribe((pages) => {
                            parentPageRelation = pages[parentPageId];
                        });

                        expect(parentPageRelation.childrenPageId.length).toBe(0);
                    });
                });
            });
        }));

        it('should update parent body', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    let parentPageBody: IBodyPage;

                    testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
                        parentPageBody = pages[parentPageId];
                    });

                    expect(testScope.findPageBrick(parentPageBody.body, childPageId)).toBeDefined();

                    testScope.service.removePage(childPageId).then(() => {
                        testScope.pageRepositoryService.pageBody$.subscribe((pages) => {
                            parentPageBody = pages[parentPageId];
                        });

                        expect(testScope.findPageBrick(parentPageBody.body, childPageId)).not.toBeDefined();
                    });
                });
            });
        }));
    });

    describe('Remove pages', () => {
        it('should remove one page', fakeAsync(() => {
            testScope.service.createPage().then((pageId) => {
                let hasPageEntities;

                testScope.hasPageEntities(pageId).then((hasPageEntities_) => hasPageEntities = hasPageEntities_);

                flushMicrotasks();
                expect(hasPageEntities).toBe(true);

                testScope.service.removePages([pageId]).then(() => {
                    spyOn(mockPouchDb, 'get').and.callFake(() => {
                        return Promise.reject();
                    });

                    testScope.hasPageEntities(pageId).then((hasPageEntities_) => hasPageEntities = hasPageEntities_);

                    flushMicrotasks();
                    expect(hasPageEntities).toBe(false);
                });
            });
        }));

        it('should remove root pages', fakeAsync(() => {
            Promise.all([
                testScope.service.createPage(),
                testScope.service.createPage()
            ]).then(([pageId1, pageId2]) => {
                let hasPageEntities1;
                let hasPageEntities2;

                testScope.hasPageEntities(pageId1).then((hasPageEntities_) => hasPageEntities1 = hasPageEntities_);
                testScope.hasPageEntities(pageId2).then((hasPageEntities_) => hasPageEntities2 = hasPageEntities_);

                flushMicrotasks();
                expect(hasPageEntities1).toBe(true);
                expect(hasPageEntities2).toBe(true);

                testScope.service.removePages([pageId1, pageId2]).then(() => {
                    spyOn(mockPouchDb, 'get').and.callFake(() => {
                        return Promise.reject();
                    });

                    testScope.hasPageEntities(pageId1).then((hasPageEntities_) => hasPageEntities1 = hasPageEntities_);
                    testScope.hasPageEntities(pageId2).then((hasPageEntities_) => hasPageEntities2 = hasPageEntities_);

                    flushMicrotasks();
                    expect(hasPageEntities1).toBe(false);
                    expect(hasPageEntities2).toBe(false);
                });
            });
        }));

        it('should remove child pages which are not siblings not root pages', async(() => {
            testScope.service.createPage().then((pageId1) => {
                Promise.all([
                    testScope.service.createPage(pageId1),
                    testScope.service.createPage(pageId1),
                ]).then(([pageId2, pageId3]) => {
                    testScope.service.createPage(pageId3).then((pageId4) => {
                        Promise.all([
                            testScope.hasPageEntities(pageId2),
                            testScope.hasPageEntities(pageId4)
                        ]).then(([hasPageEntities2, hasPageEntities4]) => {
                            expect(hasPageEntities2).toBe(true);
                            expect(hasPageEntities4).toBe(true);

                            testScope.service.removePages([pageId2, pageId4]).then(() => {
                                spyOn(mockPouchDb, 'get').and.callFake(() => {
                                    return Promise.reject();
                                });

                                Promise.all([
                                    testScope.hasPageEntities(pageId2),
                                    testScope.hasPageEntities(pageId4)
                                ]).then(([hasPageEntities2_, hasPageEntities4_]) => {
                                    expect(hasPageEntities2_).toBe(false);
                                    expect(hasPageEntities4_).toBe(false);
                                });
                            });
                        });
                    });
                });
            });
        }));

        it('should update parent body when removing child siblings pages', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                // have to create children in series cause parallel creation would lead to race condition
                testScope.service.createPage(parentPageId).then((childPageId1) => {
                    testScope.service.createPage(parentPageId).then((childPageId2) => {
                        testScope.pageRepositoryService.getBodyPage(parentPageId).then((parentBodyPage) => {
                            expect(testScope.findPageBrick(parentBodyPage.body, childPageId1)).toBeDefined();
                            expect(testScope.findPageBrick(parentBodyPage.body, childPageId2)).toBeDefined();

                            testScope.service.removePages([childPageId1, childPageId2]).then(() => {
                                testScope.pageRepositoryService.getBodyPage(parentPageId).then((updatedParentBodyPage) => {
                                    expect(testScope.findPageBrick(updatedParentBodyPage.body, childPageId1)).not.toBeDefined();
                                    expect(testScope.findPageBrick(updatedParentBodyPage.body, childPageId2)).not.toBeDefined();
                                });
                            });
                        });
                    });
                });
            });
        }));

        it('should update parent relation when removing child siblings pages', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                // have to create children in series cause parallel creation would lead to race condition
                testScope.service.createPage(parentPageId).then((childPageId1) => {
                    testScope.service.createPage(parentPageId).then((childPageId2) => {
                        testScope.pageRepositoryService.getRelationPage(parentPageId).then((parentRelationPage) => {
                            expect(parentRelationPage.childrenPageId.includes(childPageId1)).toBe(true);
                            expect(parentRelationPage.childrenPageId.includes(childPageId2)).toBe(true);

                            testScope.service.removePages([childPageId1, childPageId2]).then(() => {
                                testScope.pageRepositoryService.getRelationPage(parentPageId).then((updatedParentRelationPage) => {
                                    expect(updatedParentRelationPage.childrenPageId.includes(childPageId1)).toBe(false);
                                    expect(updatedParentRelationPage.childrenPageId.includes(childPageId2)).toBe(false);
                                });
                            });
                        });
                    });
                });
            });
        }));
    });
});
