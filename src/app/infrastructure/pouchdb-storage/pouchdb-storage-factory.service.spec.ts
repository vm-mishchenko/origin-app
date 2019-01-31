import { TestBed } from '@angular/core/testing';

import { PouchdbStorageFactoryService } from './pouchdb-storage-factory.service';

describe('PouchdbStorageFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PouchdbStorageFactoryService = TestBed.get(PouchdbStorageFactoryService);
    expect(service).toBeTruthy();
  });
});
