import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {FirebaseOptionsToken} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {DatabaseManager, InMemoryRemoteProvider, MemoryDb, RemoteDb} from 'cinatabase';
import {BrickRegistry, IBrickSnapshot, IWallDefinition, IWallModel, WallModelFactory, WallModule} from 'ngx-wall';
import {of} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {DATABASE_MANAGER, StoreModule} from '../../../infrastructure/storage/storage.module';
import {AuthService} from '../../../modules/auth';
import {PageBrickComponent} from '../ui/bricks/page-brick/page-brick.component';
import {PAGE_BRICK_TAG_NAME} from '../ui/page-ui.constant';
import {PageFileUploaderService} from './page-file-uploader.service';
import {PageService} from './page.service';

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

class TestScope2 {
    database: DatabaseManager;
    service: PageService;
    pageFileUploaderService: PageFileUploaderService;

    initialize() {
        this.service = TestBed.get(PageService);
        this.pageFileUploaderService = TestBed.get(PageFileUploaderService);
        this.database = TestBed.get(DATABASE_MANAGER);

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
            this.database.collection('page-identity').doc(pageId).isExists(),
            this.database.collection('page-body').doc(pageId).isExists(),
            this.database.collection('page-relation').doc(pageId).isExists()
        ]).then(() => {
            return true;
        }, () => {
            return Promise.resolve(false);
        });
    }

    addBrick(pageId: string, tag: string, state = {}): Promise<IBrickSnapshot> {
        return this.database.collection('page-body').doc(pageId).snapshot().then((pageBodySnapshot) => {
            const wallModel = this.createWallModel(pageBodySnapshot.data().body);

            const newBrick = wallModel.api.core.addBrickAtStart(tag, state);

            return this.service.updatePageBody2(pageBodySnapshot.id, {
                body: wallModel.api.core.getPlan()
            }).then(() => newBrick);
        });
    }
}

describe('PageService', () => {
    let testScope: TestScope2;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            WallModule.forRoot(),
            AngularFireAuthModule,
            AngularFireStorageModule,
            StoreModule
        ],
        providers: [
            {
                provide: DATABASE_MANAGER,
                useFactory: () => {
                    const memoryDb = new MemoryDb();
                    const remoteDb = new RemoteDb(new InMemoryRemoteProvider());
                    return new DatabaseManager(memoryDb, remoteDb);
                }
            },
            // mock for easier firebase and google account configuration
            {
                provide: AuthService,
                useValue: {
                    signOut$: of(null)
                }
            },
            {
                provide: FirebaseOptionsToken, useValue: environment.FIREBASE_CONFIG
            }
        ]
    }));

    beforeEach(() => {
        testScope = new TestScope2();
        testScope.initialize();
    });

    afterEach(() => {
        testScope = null;
    });

    describe('Create page 2', () => {
        it('should return created page id', async(() => {
            testScope.service.createPage2().then((id) => {
                expect(id).toBeDefined();
            });
        }));

        it('should create page identity, body-editor', async(() => {
            testScope.service.createPage2().then((id) => {
                testScope.database.collection('page-identity').doc(id).snapshot().then((snapshot) => {
                    expect(snapshot.exists).toBe(true);
                });

                testScope.database.collection('page-body').doc(id).snapshot().then((snapshot) => {
                    expect(snapshot.exists).toBe(true);
                });
            });
        }));

        it('should create page relation', async(() => {
            testScope.service.createPage2().then((id) => {
                testScope.database.collection('page-relation').doc(id).snapshot().then((pageRelation) => {
                    expect(pageRelation.exists).toBe(true);
                    expect(pageRelation.data().parentPageId).toBe(null);
                    expect(pageRelation.data().childrenPageId.length).toBe(0);
                });
            });
        }));

        it('should create child page', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.database.collection('page-identity').doc(childPageId).snapshot().then((pageIdentity) => {
                        expect(pageIdentity.exists).toBe(true);
                    });
                });
            });
        }));

        it('should create child page relation', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.database.collection('page-relation').doc(childPageId).snapshot().then((snapshot) => {
                        expect(snapshot.data().parentPageId).toBe(parentPageId);
                    });
                });
            });
        }));

        it('should update parent relation', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.database.collection('page-relation').doc(parentPageId).snapshot().then((snapshot) => {
                        expect(snapshot.data().childrenPageId.length).toBe(1);
                        expect(snapshot.data().childrenPageId[0]).toBe(childPageId);
                    });
                });
            });
        }));

        it('should add page brick to parent body-editor', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.database.collection('page-body').doc(parentPageId).snapshot().then((snapshot) => {
                        expect(testScope.findPageBrick(snapshot.data().body, childPageId)).toBeDefined();
                    });
                });
            });
        }));

        it('should update brick state in parent body-editor when pageBrickId is defined', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                const parentPageBodyDoc = testScope.database.collection('page-body').doc(parentPageId);

                parentPageBodyDoc.snapshot().then((parentPageBodySnapshot) => {
                    let parentPageModel = testScope.createWallModel(parentPageBodySnapshot.data().body);
                    const newPageBrick = parentPageModel.api.core.addBrickAtStart(PAGE_BRICK_TAG_NAME, {pageId: null});

                    parentPageBodyDoc.update({
                        body: parentPageModel.api.core.getPlan()
                    }).then(() => {
                        // test action
                        testScope.service.createPage2(parentPageId, {pageBrickId: newPageBrick.id}).then((childPageId) => {
                            parentPageBodyDoc.snapshot().then((parentPageBodySnapshotUpdated) => {
                                // test asserts
                                parentPageModel = testScope.createWallModel(parentPageBodySnapshotUpdated.data().body);

                                // make sure that "createPage" API does not create additional page
                                expect(parentPageModel.api.core.getBricksCount()).toBe(1);

                                // make sure that in body-editor there is only one brick that was created previously
                                const actualPageBrickId = parentPageModel.api.core.getBrickIds()[0];
                                expect(actualPageBrickId).toBe(newPageBrick.id);

                                // make sure that state of previously created page was populated by child page id
                                const pageBrickSnapshot = parentPageModel.api.core.getBrickSnapshot(actualPageBrickId);
                                expect(pageBrickSnapshot.state.pageId).toBe(childPageId);
                            });
                        });
                    });
                });
            });
        }));
    });

    describe('Move Page 2', () => {
        it('should handle correctly move page inside itself', async(() => {
            testScope.service.createPage2().then((pageId) => {
                testScope.service.movePage2(pageId, pageId).then(() => {
                    testScope.database.collection('page-relation').doc(pageId).snapshot().then((snapshot) => {
                        expect(snapshot.data().parentPageId).toBe(null);
                    });
                });
            });
        }));

        it('should not move page to root if it already at root level', async(() => {
            testScope.service.createPage2().then((pageId) => {
                testScope.service.movePage2(pageId, null).then(() => {
                    testScope.database.collection('page-relation').doc(pageId).snapshot().then((snapshot) => {
                        expect(snapshot.data().parentPageId).toBe(null);
                    });
                });
            });
        }));

        it('should not move page to target page if it already there', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.service.movePage2(childPageId, parentPageId).then(() => {

                        Promise.all([
                            testScope.database.collection('page-relation').doc(parentPageId).snapshot(),
                            testScope.database.collection('page-relation').doc(childPageId).snapshot()
                        ]).then(([parentPageRelationSnapshot, childPageRelationSnapshot]) => {
                            expect(childPageRelationSnapshot.data().parentPageId).toEqual(parentPageId);
                            expect(parentPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBe(true);
                        });
                    });
                });
            });
        }));

        it('should not move page if target page is a child of moved page', async(() => {
            Promise.all([
                testScope.service.createPage2(),
                testScope.service.createPage2()
            ]).then(([parentPageId, childPageId]) => {
                testScope.service.movePage2(childPageId, parentPageId).then(() => {
                    // test action
                    testScope.service.movePage2(parentPageId, childPageId).then(() => {
                        const pageRelationCollection = testScope.database.collection('page-relation');

                        pageRelationCollection.doc(parentPageId).snapshot().then((parentPageRelationSnapshot) => {
                            expect(parentPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBe(true);
                            expect(parentPageRelationSnapshot.data().parentPageId).toBe(null);
                        });

                        pageRelationCollection.doc(childPageId).snapshot().then((childPageRelationSnapshot) => {
                            expect(childPageRelationSnapshot.data().parentPageId).toBe(parentPageId);
                            expect(childPageRelationSnapshot.data().childrenPageId.length).toBe(0);
                        });
                    });
                });
            });
        }));

        describe('Target page', () => {
            it('should update children id', async(() => {
                Promise.all([
                    testScope.service.createPage2(),
                    testScope.service.createPage2()
                ]).then(([parentPageId, childPageId]) => {
                    testScope.service.movePage2(childPageId, parentPageId).then(() => {
                        testScope.database.collection('page-relation').doc(parentPageId).snapshot().then((parentPageRelationSnapshot) => {
                            expect(parentPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBe(true);
                        });
                    });
                });
            }));

            it('should update body-editor', async(() => {
                Promise.all([
                    testScope.service.createPage2(),
                    testScope.service.createPage2()
                ]).then(([parentPageId, childPageId]) => {
                    testScope.service.movePage2(childPageId, parentPageId).then(() => {
                        testScope.database.collection('page-body').doc(parentPageId).snapshot().then((parentPageBodySnapshot) => {
                            expect(Boolean(testScope.findPageBrick(parentPageBodySnapshot.data().body, childPageId))).toBe(true);
                        });
                    });
                });
            }));
        });

        describe('Old parent', () => {
            it('should update page relation', async(() => {
                Promise.all([
                    testScope.service.createPage2(),
                    testScope.service.createPage2(),
                    testScope.service.createPage2()
                ]).then(([childPageId, targetPageId, oldParentPageId]) => {
                    testScope.service.movePage2(childPageId, oldParentPageId).then(() => {
                        const pageRelations = testScope.database.collection('page-relation');

                        // make sure that old parent has child page in relation
                        pageRelations.doc(oldParentPageId).snapshot().then((oldParentPageRelationSnapshot) => {
                            expect(oldParentPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBe(true);
                        }).then(() => {
                            testScope.service.movePage2(childPageId, targetPageId).then(() => {
                                pageRelations.doc(oldParentPageId).snapshot().then((oldParentPageRelationSnapshot) => {
                                    expect(oldParentPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBe(false);
                                });
                            });
                        });
                    });
                });
            }));

            it('should update page body-editor', async(() => {
                Promise.all([
                    testScope.service.createPage2(),
                    testScope.service.createPage2(),
                    testScope.service.createPage2()
                ]).then(([childPageId, targetPageId, oldParentPageId]) => {
                    testScope.service.movePage2(childPageId, oldParentPageId).then(() => {
                        // make sure that old parent has child page in body-editor
                        const pageBodies = testScope.database.collection('page-body');

                        pageBodies.doc(oldParentPageId).snapshot().then((oldParentPageBodySnapshot) => {
                            expect(Boolean(testScope.findPageBrick(oldParentPageBodySnapshot.data().body, childPageId))).toBe(true);
                        }).then(() => {
                            testScope.service.movePage2(childPageId, targetPageId).then(() => {
                                // make sure that old parent does not have child page in body-editor
                                pageBodies.doc(oldParentPageId).snapshot().then((oldParentPageBodySnapshot) => {
                                    expect(Boolean(testScope.findPageBrick(oldParentPageBodySnapshot.data().body, childPageId)))
                                      .toBe(false);
                                });
                            });
                        });
                    });
                });
            }));
        });

        describe('Moved page', () => {
            it('should update page relation', async(() => {
                Promise.all([
                    testScope.service.createPage2(),
                    testScope.service.createPage2()
                ]).then(([childPageId, targetPageId]) => {
                    // make sure that child page id does not have a parent
                    const pageRelations = testScope.database.collection('page-relation');

                    pageRelations.doc(childPageId).snapshot().then((movedPageRelationSnapshot) => {
                        expect(movedPageRelationSnapshot.data().parentPageId).toBe(null);
                    }).then(() => {
                        testScope.service.movePage2(childPageId, targetPageId).then(() => {
                            pageRelations.doc(childPageId).snapshot().then((movedPageRelationSnapshot) => {
                                expect(movedPageRelationSnapshot.data().parentPageId).toBe(targetPageId);
                            });
                        });
                    });
                });
            }));
        });
    });

    describe('Remove page 2', () => {
        it('should delete page identity, body-editor, relation', async(() => {
            testScope.service.createPage2().then((pageId) => {
                testScope.service.removePage2(pageId).then(() => {
                    testScope.database.collection('page-identity').doc(pageId).snapshot().then((snapshot) => {
                        expect(snapshot.exists).toBe(false);
                    });

                    testScope.database.collection('page-body').doc(pageId).snapshot().then((snapshot) => {
                        expect(snapshot.exists).toBe(false);
                    });

                    testScope.database.collection('page-relation').doc(pageId).snapshot().then((snapshot) => {
                        expect(snapshot.exists).toBe(false);
                    });
                });
            });
        }));

        it('should delete child page identity, body-editor, relation', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.service.removePage2(parentPageId).then(() => {
                        testScope.database.collection('page-identity').doc(childPageId).snapshot().then((snapshot) => {
                            expect(snapshot.exists).toBe(false);
                        });

                        testScope.database.collection('page-body').doc(childPageId).snapshot().then((snapshot) => {
                            expect(snapshot.exists).toBe(false);
                        });

                        testScope.database.collection('page-relation').doc(childPageId).snapshot().then((snapshot) => {
                            expect(snapshot.exists).toBe(false);
                        });
                    });
                });
            });
        }));

        it('should delete all sub child page identity, body-editor, relation', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    testScope.service.createPage2(childPageId).then((subChildPageId) => {
                        testScope.service.removePage2(parentPageId).then(() => {
                            testScope.database.collection('page-identity').doc(subChildPageId).snapshot().then((snapshot) => {
                                expect(snapshot.exists).toBe(false);
                            });

                            testScope.database.collection('page-body').doc(subChildPageId).snapshot().then((snapshot) => {
                                expect(snapshot.exists).toBe(false);
                            });

                            testScope.database.collection('page-relation').doc(subChildPageId).snapshot().then((snapshot) => {
                                expect(snapshot.exists).toBe(false);
                            });
                        });
                    });
                });
            });
        }));

        it('should update parent relation children', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    const parentPageRelationDoc = testScope.database.collection('page-relation').doc(parentPageId);

                    parentPageRelationDoc.snapshot().then((parentPageRelationSnapshot) => {
                        expect(parentPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBeTruthy();
                    });

                    testScope.service.removePage2(childPageId).then(() => {
                        parentPageRelationDoc.snapshot().then((parentPageRelationSnapshot) => {
                            expect(parentPageRelationSnapshot.data().childrenPageId.length).toBe(0);
                        });
                    });
                });
            });
        }));

        it('should update parent body-editor', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    const pageBodies = testScope.database.collection('page-body');

                    pageBodies.doc(parentPageId).snapshot().then((parentBodyPageSnapshot) => {
                        expect(testScope.findPageBrick(parentBodyPageSnapshot.data().body, childPageId)).toBeDefined();
                    });

                    testScope.service.removePage2(childPageId).then(() => {
                        pageBodies.doc(parentPageId).snapshot().then((parentBodyPageSnapshot) => {
                            expect(testScope.findPageBrick(parentBodyPageSnapshot.data().body, childPageId)).not.toBeDefined();
                        });
                    });
                });
            });
        }));

        it('should remove page file resources', async(() => {
            testScope.service.createPage2().then((pageId) => {
                const FAKE_FILE_PATH = 'https://fake/file.txt';

                testScope.addBrick(pageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                    const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                    testScope.service.removePage2(pageId).then(() => {
                        expect(removeFileSpy).toHaveBeenCalled();
                        expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                    });
                });
            });
        }));

        it('should remove child page file resources', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    const FAKE_FILE_PATH = 'https://fake/file.txt';

                    testScope.addBrick(childPageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                        const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                        testScope.service.removePage2(parentPageId).then(() => {
                            expect(removeFileSpy).toHaveBeenCalled();
                            expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                        });
                    });
                });
            });
        }));
    });

    describe('Remove pages 2', () => {
        it('should remove one page', async(() => {
            testScope.service.createPage2().then((pageId) => {
                testScope.hasPageEntities(pageId).then((hasPageEntities) => {
                    expect(hasPageEntities).toBe(true);
                });

                testScope.service.removePages2([pageId]).then(() => {
                    testScope.hasPageEntities(pageId).then((hasPageEntities) => {
                        expect(hasPageEntities).toBe(false);
                    });
                });
            });
        }));

        it('should remove root pages', async(() => {
            Promise.all([
                testScope.service.createPage2(),
                testScope.service.createPage2()
            ]).then(([pageId1, pageId2]) => {
                testScope.hasPageEntities(pageId1).then((hasPageEntities) => {
                    expect(hasPageEntities).toBe(true);
                });

                testScope.hasPageEntities(pageId2).then((hasPageEntities) => {
                    expect(hasPageEntities).toBe(true);
                });

                testScope.service.removePages2([pageId1, pageId2]).then(() => {
                    testScope.hasPageEntities(pageId1).then((hasPageEntities) => {
                        expect(hasPageEntities).toBe(false);
                    });

                    testScope.hasPageEntities(pageId2).then((hasPageEntities) => {
                        expect(hasPageEntities).toBe(false);
                    });
                });
            });
        }));

        it('should remove child pages which are not siblings not root pages', async(() => {
            testScope.service.createPage2().then((pageId1) => {
                Promise.all([
                    testScope.service.createPage2(pageId1),
                    testScope.service.createPage2(pageId1),
                ]).then(([pageId2, pageId3]) => {
                    testScope.service.createPage2(pageId3).then((pageId4) => {
                        Promise.all([
                            testScope.hasPageEntities(pageId2),
                            testScope.hasPageEntities(pageId4)
                        ]).then(([hasPageEntities2, hasPageEntities4]) => {
                            expect(hasPageEntities2).toBe(true);
                            expect(hasPageEntities4).toBe(true);

                            testScope.service.removePages2([pageId2, pageId4]).then(() => {
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

        it('should update parent body-editor when removing child siblings pages', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                // have to create children in series cause parallel creation would lead to race condition
                testScope.service.createPage2(parentPageId).then((childPageId1) => {
                    testScope.service.createPage2(parentPageId).then((childPageId2) => {
                        const pageBodies = testScope.database.collection('page-body');

                        pageBodies.doc(parentPageId).snapshot().then((parentBodyPageSnapshot) => {
                            expect(testScope.findPageBrick(parentBodyPageSnapshot.data().body, childPageId1)).toBeDefined();
                            expect(testScope.findPageBrick(parentBodyPageSnapshot.data().body, childPageId2)).toBeDefined();

                            testScope.service.removePages2([childPageId1, childPageId2]).then(() => {
                                pageBodies.doc(parentPageId).snapshot().then((updatedParentBodyPageSnapshot) => {
                                    expect(testScope.findPageBrick(updatedParentBodyPageSnapshot.data().body, childPageId1)).not.toBeDefined();
                                    expect(testScope.findPageBrick(updatedParentBodyPageSnapshot.data().body, childPageId2)).not.toBeDefined();
                                });
                            });
                        });
                    });
                });
            });
        }));

        it('should update parent relation when removing child siblings pages', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                // have to create children in series cause parallel creation would lead to race condition
                testScope.service.createPage2(parentPageId).then((childPageId1) => {
                    testScope.service.createPage2(parentPageId).then((childPageId2) => {
                        const pageRelations = testScope.database.collection('page-relation');

                        pageRelations.doc(parentPageId).snapshot().then((parentRelationPageSnapshot) => {
                            expect(parentRelationPageSnapshot.data().childrenPageId.includes(childPageId1)).toBe(true);
                            expect(parentRelationPageSnapshot.data().childrenPageId.includes(childPageId2)).toBe(true);

                            testScope.service.removePages2([childPageId1, childPageId2]).then(() => {
                                pageRelations.doc(parentPageId).snapshot().then((updatedParentRelationPageSnapshot) => {
                                    expect(updatedParentRelationPageSnapshot.data().childrenPageId.includes(childPageId1)).toBe(false);
                                    expect(updatedParentRelationPageSnapshot.data().childrenPageId.includes(childPageId2)).toBe(false);
                                });
                            });
                        });
                    });
                });
            });
        }));

        it('should remove page file resources', async(() => {
            testScope.service.createPage2().then((pageId) => {
                const FAKE_FILE_PATH = 'https://fake/file.txt';

                testScope.addBrick(pageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                    const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                    testScope.service.removePages2([pageId]).then(() => {
                        expect(removeFileSpy).toHaveBeenCalled();
                        expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                    });
                });
            });
        }));

        it('should remove child page file resources', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                testScope.service.createPage2(parentPageId).then((childPageId) => {
                    const FAKE_FILE_PATH = 'https://fake/file.txt';

                    testScope.addBrick(childPageId, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH}).then(() => {
                        const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                        testScope.service.removePages2([parentPageId]).then(() => {
                            expect(removeFileSpy).toHaveBeenCalled();
                            expect(removeFileSpy.calls.mostRecent().args[0]).toEqual(FAKE_FILE_PATH);
                        });
                    });
                });
            });
        }));

        it('should remove file resources from siblings pages', async(() => {
            testScope.service.createPage2().then((parentPageId) => {
                Promise.all([
                    testScope.service.createPage2(parentPageId),
                    testScope.service.createPage2(parentPageId),
                ]).then(([childPageId1, childPageId2]) => {
                    const FAKE_FILE_PATH1 = 'https://fake/file1.txt';
                    const FAKE_FILE_PATH2 = 'https://fake/file2.txt';

                    Promise.all([
                        testScope.addBrick(childPageId1, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH1}),
                        testScope.addBrick(childPageId2, FIXTURE_BRICK_SPECIFICATION.tag, {path: FAKE_FILE_PATH2}),
                    ]).then(() => {
                        const removeFileSpy = spyOn(testScope.pageFileUploaderService, 'remove');

                        testScope.service.removePages2([childPageId1, childPageId2]).then(() => {
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

    describe('Move bricks', () => {
        it('should move non page bricks', async(() => {
            Promise.all([
                testScope.service.createPage2(),
                testScope.service.createPage2()
            ]).then(([sourcePageId, targetPageId]) => {
                const pageBodies = testScope.database.collection('page-body');

                pageBodies.doc(sourcePageId).snapshot().then((sourcePageBodySnapshot) => {
                    let sourcePageWallModel = testScope.createWallModel(sourcePageBodySnapshot.data().body);

                    const fixtureState1 = {fixture: 1};
                    const fixtureState2 = {fixture: 2};
                    const brickSnapshot1 = sourcePageWallModel.api.core.addBrickAtStart('fixture-brick', fixtureState1);
                    const brickSnapshot2 = sourcePageWallModel.api.core.addBrickAtStart('fixture-brick', fixtureState2);

                    testScope.service.updatePageBody2(sourcePageId, {
                        body: sourcePageWallModel.api.core.getPlan()
                    }).then(() => {
                        // test action
                        testScope.service.moveBricks2(sourcePageId, [brickSnapshot1.id, brickSnapshot2.id], targetPageId).then(() => {
                            Promise.all([
                                pageBodies.doc(sourcePageId).snapshot(),
                                pageBodies.doc(targetPageId).snapshot()
                            ]).then(([sourcePageBodyUpdatedSnapshot, targetPageBodySnapshot]) => {
                                sourcePageWallModel = testScope.createWallModel(sourcePageBodyUpdatedSnapshot.data().body);

                                // test assertion: bricks was removed from source page
                                expect(Boolean(sourcePageWallModel.api.core.getBrickSnapshot(brickSnapshot1.id))).toBe(false);
                                expect(Boolean(sourcePageWallModel.api.core.getBrickSnapshot(brickSnapshot2.id))).toBe(false);


                                const targetPageWallModel = testScope.createWallModel(targetPageBodySnapshot.data().body);
                                const targetBrickIds = targetPageWallModel.api.core.getBrickIds();

                                // bricks was added to target page
                                expect(targetBrickIds.length).toEqual(2);

                                // bricks was added in right order
                                expect(targetPageWallModel.api.core.getBrickSnapshot(targetBrickIds[0]).state.fixture).toBe(fixtureState1.fixture);
                                expect(targetPageWallModel.api.core.getBrickSnapshot(targetBrickIds[1]).state.fixture).toBe(fixtureState2.fixture);
                            });
                        });
                    });
                });
            });
        }));

        it('should move page and other bricks', async(() => {
            Promise.all([
                testScope.service.createPage2(),
                testScope.service.createPage2()
            ]).then(([sourcePageId, targetPageId]) => {
                // add couple pages to source page
                // there is limitation which does not allow to add pages in parallel, more read in create page comments
                testScope.service.createPage2(sourcePageId)
                  .then((childPageId1) => {
                      testScope.service.createPage2(sourcePageId).then((childPageId2) => {
                          const pageBodies = testScope.database.collection('page-body');
                          const pageRelations = testScope.database.collection('page-relation');

                          pageBodies.doc(sourcePageId).snapshot().then((sourcePageBodySnapshot) => {
                              // add couple non page bricks to source page
                              let sourcePageWallModel = testScope.createWallModel(sourcePageBodySnapshot.data().body);

                              const fixtureState1 = {fixture: 1};
                              const fixtureState2 = {fixture: 2};
                              const brickSnapshot1 = sourcePageWallModel.api.core.addBrickAtStart('fixture-brick', fixtureState1);
                              const brickSnapshot2 = sourcePageWallModel.api.core.addBrickAtStart('fixture-brick', fixtureState2);
                              const pageBrickId1 = testScope.findPageBrick(sourcePageBodySnapshot.data().body, childPageId1).id;
                              const pageBrickId2 = testScope.findPageBrick(sourcePageBodySnapshot.data().body, childPageId2).id;

                              testScope.service.updatePageBody2(sourcePageId, {
                                  body: sourcePageWallModel.api.core.getPlan()
                              }).then(() => {
                                  const movedBrickIds = [
                                      pageBrickId1,
                                      pageBrickId2,
                                      brickSnapshot1.id,
                                      brickSnapshot2.id,
                                  ];

                                  // test action
                                  testScope.service.moveBricks2(sourcePageId, movedBrickIds, targetPageId).then(() => {
                                      Promise.all([
                                          pageBodies.doc(sourcePageId).snapshot(),
                                          pageBodies.doc(targetPageId).snapshot(),
                                          pageRelations.doc(targetPageId).snapshot(),
                                          pageRelations.doc(childPageId1).snapshot(),
                                          pageRelations.doc(childPageId2).snapshot()
                                      ]).then(([sourcePageBodyUpdatedSnapshot, targetPageBodySnapshot,
                                                   targetPageRelationSnapshot, childPageRelation1Snapshot,
                                                   childPageRelation2Snapshot]) => {
                                          // test assertions
                                          sourcePageWallModel = testScope.createWallModel(sourcePageBodyUpdatedSnapshot.data().body);

                                          // test assertion: non page bricks was removed from source page
                                          expect(Boolean(sourcePageWallModel.api.core.getBrickSnapshot(brickSnapshot1.id))).toBe(false);
                                          expect(Boolean(sourcePageWallModel.api.core.getBrickSnapshot(brickSnapshot2.id))).toBe(false);

                                          // test assertion:page bricks was removed from source page
                                          expect(Boolean(sourcePageWallModel.api.core.getBrickSnapshot(pageBrickId1))).toBe(false);
                                          expect(Boolean(sourcePageWallModel.api.core.getBrickSnapshot(pageBrickId2))).toBe(false);

                                          const targetPageWallModel = testScope.createWallModel(targetPageBodySnapshot.data().body);
                                          const targetBrickIds = targetPageWallModel.api.core.getBrickIds();

                                          // bricks was added to target page
                                          expect(targetBrickIds.length).toEqual(4);

                                          const tagetBrickSnapshots = targetBrickIds
                                            .map((targetBrickId) => targetPageWallModel.api.core.getBrickSnapshot(targetBrickId));

                                          // fixture bricks was added to target body-editor page
                                          const fixtureBrickSnapshots = tagetBrickSnapshots
                                            .filter((tagetBrickSnapshot) => tagetBrickSnapshot.tag === 'fixture-brick');
                                          expect(fixtureBrickSnapshots.length).toEqual(2);

                                          // page bricks was added to target body-editor page
                                          const pageBrickSnapshots = tagetBrickSnapshots
                                            .filter((tagetBrickSnapshot) => tagetBrickSnapshot.tag === PAGE_BRICK_TAG_NAME);
                                          expect(pageBrickSnapshots.length).toEqual(2);

                                          // target relation contains moved pages
                                          [
                                              childPageId1,
                                              childPageId2
                                          ].forEach((childPageId) => {
                                              expect(targetPageRelationSnapshot.data().childrenPageId.includes(childPageId)).toBe(true);
                                          });

                                          // child parent id points to target page id
                                          expect(childPageRelation1Snapshot.data().parentPageId).toBe(targetPageId);
                                          expect(childPageRelation2Snapshot.data().parentPageId).toBe(targetPageId);
                                      });
                                  });
                              });
                          });
                      });
                  });
            });
        }));
    });
});
