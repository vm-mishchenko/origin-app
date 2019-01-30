import { TestBed } from '@angular/core/testing';

import { PageMemoryStorage } from './page-memory-storage.service';

describe('PageMemoryStorage', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PageMemoryStorage = TestBed.get(PageMemoryStorage);
    expect(service).toBeTruthy();
  });
});
