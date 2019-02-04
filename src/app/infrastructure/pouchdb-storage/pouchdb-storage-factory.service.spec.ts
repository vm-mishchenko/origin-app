import {TestBed} from '@angular/core/testing';

import {PouchdbStorageFactory} from './pouchdb-storage-factory.service';
import {PouchdbStorageModule} from './pouchdb-storage.module';

describe('PouchdbStorageFactoryService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [PouchdbStorageModule]
    }));

    it('should be created', () => {
        const service: PouchdbStorageFactory = TestBed.get(PouchdbStorageFactory);
        expect(service).toBeTruthy();
    });
});
