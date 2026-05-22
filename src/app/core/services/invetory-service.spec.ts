import { TestBed } from '@angular/core/testing';

import { InvetoryService } from './invetory-service';

describe('InvetoryService', () => {
  let service: InvetoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvetoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
