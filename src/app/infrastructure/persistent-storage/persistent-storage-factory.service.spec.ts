import { TestBed } from '@angular/core/testing';

import { PersistentStorageFactory } from './persistent-storage-factory.service';

describe('PersistentStorageFactory', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PersistentStorageFactory = TestBed.get(PersistentStorageFactory);
    expect(service).toBeTruthy();
  });
});
