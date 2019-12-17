import { NgxsActiveConnectionsService } from './ngxs-active-connections.service';

describe('NgxsActiveConnectionsService', () => {
  let store;

  beforeEach(() => {
    store = jest.fn();
  });

  it('should be created', () => {
    const service: NgxsActiveConnectionsService = new NgxsActiveConnectionsService(store);
    expect(service).toBeTruthy();
  });
});
