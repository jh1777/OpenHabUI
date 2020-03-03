import { TestBed } from '@angular/core/testing';

import { OpenhabApiService } from './openhab-api.service';

describe('OpenhabApiService', () => {
  let service: OpenhabApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenhabApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
