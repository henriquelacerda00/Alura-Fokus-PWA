import { TestBed } from '@angular/core/testing';

import { CacheInspectorService } from './cache-inspector.service';

describe('CacheInspectorService', () => {
  let service: CacheInspectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheInspectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
