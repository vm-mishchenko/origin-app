import {TestBed} from '@angular/core/testing';

import {PouchdbStorageFactory} from './pouchdb-storage-factory.service';

describe('PouchdbStorageFactoryService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: PouchdbStorageFactory = TestBed.get(PouchdbStorageFactory);
        expect(service).toBeTruthy();
    });
});
