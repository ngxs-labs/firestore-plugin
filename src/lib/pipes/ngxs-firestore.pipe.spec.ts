import { NgxsFirestorePipe } from './ngxs-firestore.pipe';

describe('NgxsFirestorePipe', () => {
  let store;
  let dispatchFn: jest.Mock;

  beforeEach(() => {
    store = jest.fn();
    dispatchFn = jest.fn();

    store.mockImplementation(
      () => ({
        dispatch: dispatchFn
      })
    );

    store.mockClear();
    dispatchFn.mockClear();
  });

  it('create an instance', () => {
    const pipe = new NgxsFirestorePipe(store());
    expect(pipe).toBeTruthy();
  });

  it('dispatch action', () => {
    const pipe = new NgxsFirestorePipe(store());
    const actionName = '[TEST] action';

    pipe.transform([], actionName);

    expect(dispatchFn).toHaveBeenCalled();
    expect(dispatchFn).toHaveBeenCalledWith({ type: actionName });
  });

  it('returns same value', () => {
    const pipe = new NgxsFirestorePipe(store());
    const arrayResult = [];
    expect(pipe.transform(arrayResult, '')).toEqual(arrayResult);
    const stringResult = 'a';
    expect(pipe.transform(stringResult, '')).toEqual(stringResult);
    const objResult = { a: 'a' };
    expect(pipe.transform(objResult, '')).toEqual(objResult);
  });

  it('only dispatch an action once', () => {
    const pipe = new NgxsFirestorePipe(store());
    const actionName = '[TEST] action';

    pipe.transform([], actionName);
    pipe.transform([], actionName);
    pipe.transform([], actionName);
    expect(dispatchFn).toHaveBeenCalledTimes(1);
    expect(dispatchFn).toHaveBeenCalledWith({ type: actionName });
  });

  it('disconnects onDestroy', () => {
    const pipe = new NgxsFirestorePipe(store());
    const actionName = '[TEST] action';
    const disconnectActionName = '[TEST] action Disconnect';

    pipe.transform([], actionName);
    pipe.ngOnDestroy();
    expect(dispatchFn).toHaveBeenCalledTimes(2);
    expect(dispatchFn).toHaveBeenCalledWith({ type: actionName });
    expect(dispatchFn).toHaveBeenCalledWith({ type: disconnectActionName });
  });

});
