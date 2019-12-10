import { NgxsFirestorePipe } from './ngxs-firestore.pipe';

describe('NgxsFirestorePipe', () => {
  let store;
  let dispatchFn: jest.Mock;
  beforeEach(() => {
    store = jest.fn();
    dispatchFn = jest.fn();
    dispatchFn.mockClear();

    store.mockImplementation(
      () => ({
        dispatch: dispatchFn
      })
    );
  });

  it('create an instance', () => {
    const pipe = new NgxsFirestorePipe(store());
    expect(pipe).toBeTruthy();
  });

  it('transforms', () => {
    const pipe = new NgxsFirestorePipe(store());

    pipe.transform('', '');

    expect(dispatchFn.mock.calls.length).toEqual(1);
  });

});
