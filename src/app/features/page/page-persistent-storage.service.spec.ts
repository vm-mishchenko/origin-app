import { TestBed } from '@angular/core/testing';

import { PagePersistentStorage } from './page-persistent-storage.service';

describe('PagePersistentStorage', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PagePersistentStorage = TestBed.get(PagePersistentStorage);
    expect(service).toBeTruthy();
  });
});
