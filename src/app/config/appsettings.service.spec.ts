import { TestBed } from '@angular/core/testing';

import { AppsettingsService } from './appsettings.service';

describe('AppsettingsService', () => {
  let service: AppsettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppsettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
