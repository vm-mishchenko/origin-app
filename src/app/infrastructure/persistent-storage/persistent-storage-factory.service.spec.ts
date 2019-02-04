import {TestBed} from '@angular/core/testing';

import {PersistentStorageFactory} from './persistent-storage-factory.service';
import {PersistentStorageModule} from './persistent-storage.module';

describe('PersistentStorageFactory', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [PersistentStorageModule]
    }));

    it('should be created', () => {
        const service: PersistentStorageFactory = TestBed.get(PersistentStorageFactory);
        expect(service).toBeTruthy();
    });
});
