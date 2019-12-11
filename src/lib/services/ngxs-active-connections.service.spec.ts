import { TestBed } from '@angular/core/testing';

import { NgxsActiveConnectionsService } from './ngxs-active-connections.service';

describe('NgxsActiveConnectionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxsActiveConnectionsService = TestBed.get(NgxsActiveConnectionsService);
    expect(service).toBeTruthy();
  });
});
