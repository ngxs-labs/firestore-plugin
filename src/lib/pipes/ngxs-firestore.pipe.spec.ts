import { NgxsFirestorePipe } from './ngxs-firestore.pipe';
import { fakeAsync, tick } from '@angular/core/testing';

describe('NgxsFirestorePipe', () => {
    let store;
    let dispatchFn: jest.Mock;

    beforeEach(() => {
        store = jest.fn();
        dispatchFn = jest.fn();

        store.mockImplementation(() => ({
            dispatch: dispatchFn
        }));

        store.mockClear();
        dispatchFn.mockClear();
    });

    it('create an instance', () => {
        const pipe = new NgxsFirestorePipe(store());
        expect(pipe).toBeTruthy();
    });

    it('dispatch action on next tick', fakeAsync(() => {
        const pipe = new NgxsFirestorePipe(store());
        const actionName = '[TEST] action';

        pipe.transform([], actionName);

        expect(dispatchFn).not.toHaveBeenCalled();
        tick(1);
        expect(dispatchFn).toHaveBeenCalled();
        expect(dispatchFn).toHaveBeenCalledWith({ type: actionName });
    }));

    it('returns same value', fakeAsync(() => {
        const pipe = new NgxsFirestorePipe(store());
        let pipeResult;

        const arrayResult = [];
        pipeResult = pipe.transform(arrayResult, '');
        tick(1);
        expect(pipeResult).toEqual(arrayResult);

        const stringResult = 'a';
        pipeResult = pipe.transform(stringResult, '');
        tick(1);
        expect(pipeResult).toEqual(stringResult);

        const objResult = { a: 'a' };
        pipeResult = pipe.transform(objResult, '');
        tick(1);
        expect(pipeResult).toEqual(objResult);
    }));

    it('only dispatch an action once', fakeAsync(() => {
        const pipe = new NgxsFirestorePipe(store());
        const actionName = '[TEST] action';

        pipe.transform([], actionName);
        pipe.transform([], actionName);
        pipe.transform([], actionName);
        expect(dispatchFn).not.toHaveBeenCalled();
        tick(1);
        expect(dispatchFn).toHaveBeenCalledTimes(1);
        expect(dispatchFn).toHaveBeenCalledWith({ type: actionName });
    }));

    it('disconnects onDestroy', fakeAsync(() => {
        const pipe = new NgxsFirestorePipe(store());
        const actionName = '[TEST] action';
        const disconnectActionName = '[TEST] action Disconnect';

        pipe.transform([], actionName);
        tick(1);
        pipe.ngOnDestroy();
        expect(dispatchFn).toHaveBeenCalledTimes(2);
        expect(dispatchFn).toHaveBeenCalledWith({ type: actionName });
        expect(dispatchFn).toHaveBeenCalledWith({ type: disconnectActionName });
    }));
});
