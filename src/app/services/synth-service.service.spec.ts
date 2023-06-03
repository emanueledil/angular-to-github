import { TestBed } from '@angular/core/testing';

import { SynthServiceService } from './synth-service.service';

describe('SynthServiceService', () => {
  let service: SynthServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SynthServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
