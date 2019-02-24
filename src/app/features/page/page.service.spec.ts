import {Component} from '@angular/core';
import {async, fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {FirebaseOptionsToken} from '@angular/fire';
import {BrickRegistry, IBrickSnapshot, IWallDefinition, IWallModel, WallModelFactory} from 'ngx-wall';
import {environment} from '../../../environments/environment';
import {PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {PouchdbStorageFactory} from '../../infrastructure/pouchdb/pouchdb-storage';
import {EntityStorePouchDbMock} from '../../infrastructure/pouchdb/pouchdb-storage/test/entity-store-pouchdb-mock';
import {PageBrickComponent} from '../page-ui/bricks/page-brick/page-brick.component';
import {PAGE_BRICK_TAG_NAME} from '../page-ui/page-ui.constant';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageRepositoryService} from './page-repository.service';
import {PageModule} from './page.module';
import {PageService} from './page.service';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Component({
    selector: 'fixture-brick',
    template: ''
})
class FixtureComponent {
}

const FIXTURE_BRICK_SPECIFICATION = {
    tag: 'fixture-brick',
    component: FixtureComponent,
    name: 'Fixture',
    description: 'fixture component',
    getBrickResourcePaths: (brickSnapshot) => {
        if (brickSnapshot.state && brickSnapshot.state.path) {
            return [brickSnapshot.state.path];
        }

        return [];
    }
};

class TestScope {
    service: PageService;
    pageRepositoryService: PageRepositoryService;
    pageFileUploaderService: PageFileUploaderService;

    initialize() {
        const persistentStorageFactory: PersistentStorageFactory = TestBed.get(PersistentStorageFactory);
        persistentStorageFactory.setOptions({pouchDbSavingDebounceTime: 0});

        this.service = TestBed.get(PageService);
        this.pageRepositoryService = TestBed.get(PageRepositoryService);
        this.pageFileUploaderService = TestBed.get(PageFileUploaderService);

        const brickRegistry: BrickRegistry = TestBed.get(BrickRegistry);

        brickRegistry.register({
            tag: PAGE_BRICK_TAG_NAME,
            component: PageBrickComponent,
            name: 'Page',
            description: 'Embed a sub-page inside this page'
        });

        brickRegistry.register(FIXTURE_BRICK_SPECIFICATION);
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

    addBrick(pageId: string, tag: string, state = {}): Promise<IBrickSnapshot> {
        let pageBody: IBodyPage;

        this.pageRepositoryService.pageBody$.subscribe((pages) => {
            pageBody = pages[pageId];
        });

        const wallModel = this.createWallModel(pageBody.body);

        const newBrick = wallModel.api.core.addBrickAtStart(tag, state);

        return this.service.updatePageBody({
            ...pageBody,
            body: wallModel.api.core.getPlan()
        }).then(() => newBrick);
    }
}

describe('PageService', () => {
    const mockPouchDb = new EntityStorePouchDbMock();
    let testScope: TestScope;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            PageModule
        ],
        providers: [
            {
                provide: PouchdbStorageFactory,
                useValue: {
                    createPouchDB: () => mockPouchDb
                }
            },
            {
                provide: FirebaseOptionsToken, useValue: environment.FIREBASE_CONFIG
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

        it('should remove page file resources', async(() => {
            testScope.service.createPage().then((pageId) => {
                const FAKE_FILE_PATH = 'https://fake/file.txt';

                testScope.addBrick(pageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                    const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                    testScope.service.removePage(pageId).then(() => {
                        expect(removeFileSpy).toHaveBeenCalled();
                        expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                    });
                });
            });
        }));

        it('should remove child page file resources', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    const FAKE_FILE_PATH = 'https://fake/file.txt';

                    testScope.addBrick(childPageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                        const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                        testScope.service.removePage(parentPageId).then(() => {
                            expect(removeFileSpy).toHaveBeenCalled();
                            expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                        });
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

        it('should remove page file resources', async(() => {
            testScope.service.createPage().then((pageId) => {
                const FAKE_FILE_PATH = 'https://fake/file.txt';

                testScope.addBrick(pageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                    const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                    testScope.service.removePages([pageId]).then(() => {
                        expect(removeFileSpy).toHaveBeenCalled();
                        expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                    });
                });
            });
        }));

        it('should remove child page file resources', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    const FAKE_FILE_PATH = 'https://fake/file.txt';

                    testScope.addBrick(childPageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                        const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                        testScope.service.removePages([parentPageId]).then(() => {
                            expect(removeFileSpy).toHaveBeenCalled();
                            expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                        });
                    });
                });
            });
        }));

        it('should remove file resources from siblings pages', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                Promise.all([
                    testScope.service.createPage(parentPageId),
                    testScope.service.createPage(parentPageId),
                ]).then(([childPageId1, childPageId2]) => {
                    const FAKE_FILE_PATH1 = 'https://fake/file1.txt';
                    const FAKE_FILE_PATH2 = 'https://fake/file2.txt';

                    Promise.all([
                        testScope.addBrick(childPageId1, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH1}),
                        testScope.addBrick(childPageId2, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH2}),
                    ]).then(() => {
                        const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                        testScope.service.removePages([childPageId1, childPageId2]).then(() => {
                            expect(removeFileSpy).toHaveBeenCalled();

                            const removedFileResources = removeFileSpy.calls.allArgs().map((arg) => arg[0]);

                            expect(removedFileResources.includes(FAKE_FILE_PATH1)).toBe(true);
                            expect(removedFileResources.includes(FAKE_FILE_PATH2)).toBe(true);
                        });
                    });
                });
            });
        }));
    });

    describe('Move page', () => {
        it('should handle correctly move page inside itself', async(() => {
            testScope.service.createPage().then((pageId) => {
                testScope.service.movePage(pageId, pageId).then(() => {
                    testScope.pageRepositoryService.getRelationPage(pageId).then((pageRelation) => {
                        expect(pageRelation.parentPageId).toBe(null);
                    });
                });
            });
        }));

        it('should not move page to root if it already at root level', async(() => {
            testScope.service.createPage().then((pageId) => {
                testScope.service.movePage(pageId, null).then(() => {
                    testScope.pageRepositoryService.getRelationPage(pageId).then((pageRelation) => {
                        expect(pageRelation.parentPageId).toBe(null);
                    });
                });
            });
        }));

        it('should not move page to target page if it already there', async(() => {
            testScope.service.createPage().then((parentPageId) => {
                testScope.service.createPage(parentPageId).then((childPageId) => {
                    testScope.service.movePage(childPageId, parentPageId).then(() => {
                        Promise.all([
                            testScope.pageRepositoryService.getRelationPage(parentPageId),
                            testScope.pageRepositoryService.getRelationPage(childPageId),
                        ]).then(([parentPageRelation, childPageRelation]) => {
                            expect(childPageRelation.parentPageId).toEqual(parentPageId);
                            expect(parentPageRelation.childrenPageId.includes(childPageId)).toBe(true);
                        });
                    });
                });
            });
        }));

        describe('Target page', () => {
            it('should update children id', async(() => {
                Promise.all([
                    testScope.service.createPage(),
                    testScope.service.createPage()
                ]).then(([parentPageId, childPageId]) => {
                    testScope.service.movePage(childPageId, parentPageId).then(() => {
                        testScope.pageRepositoryService.getRelationPage(parentPageId).then((parentPageRelation) => {
                            expect(parentPageRelation.childrenPageId.includes(childPageId)).toBe(true);
                        });
                    });
                });
            }));

            it('should update body', async(() => {
                Promise.all([
                    testScope.service.createPage(),
                    testScope.service.createPage()
                ]).then(([parentPageId, childPageId]) => {
                    testScope.service.movePage(childPageId, parentPageId).then(() => {
                        testScope.pageRepositoryService.getBodyPage(parentPageId).then((parentPageBody) => {
                            expect(Boolean(testScope.findPageBrick(parentPageBody.body, childPageId))).toBe(true);
                        });
                    });
                });
            }));
        });
    });
});
