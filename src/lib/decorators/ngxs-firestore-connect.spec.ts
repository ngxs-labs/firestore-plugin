import { NgxsFirestoreConnect } from './ngxs-firestore-connect';
import { State, NgxsModule, Store, Action, StateContext, Actions, ofActionCompleted, getActionTypeFromInstance } from '@ngxs/store';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FirestoreService } from '../services/firestore.service';
import { NgxsFirestoreModule } from '../ngxs-firestore.module';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Disconnect } from '../actions';

describe('NgxsFirestoreConnect', () => {
  let store: Store;
  let actions: Actions;
  let testFirestoreMock;
  let collectionFn: jest.Mock;
  const actionType = '[TEST] GetTestData';
  const emitActionType = '[TEST] GetTestData Emit';
  const disconnectActionType = '[TEST] GetTestData Disconnect';

  const asyncFirestoreResponse = () => {
    const asyncFirestoreResponseBS = new BehaviorSubject(['a', 'b', 'c']);
    const asyncFirestoreResponse$ = asyncFirestoreResponseBS.asObservable().pipe(delay(100));
    return {
      BS: asyncFirestoreResponseBS,
      $: asyncFirestoreResponse$
    };
  };

  class TestFirestore extends FirestoreService<{}> {
    path = 'test';
  }

  class GetTestData {
    static readonly type = actionType;
  }

  class GetTestDataEmit {
    static readonly type = emitActionType;
  }

  class GetTestDataDisconnect {
    static readonly type = disconnectActionType;
  }

  interface TestStateModel {
    items: string[];
  }

  @State<TestStateModel>({
    name: 'test',
    defaults: {
      items: []
    }
  })
  class TestState {

    constructor(
      private fs: TestFirestore
    ) {

    }

    @NgxsFirestoreConnect(GetTestData, (payload): Partial<TestStateModel> => ({ items: payload }))
    @Action(GetTestData)
    getTestData(ctx: StateContext<TestStateModel>) {
      return this.fs.collection$();
    }
  }

  beforeEach(() => {
    collectionFn = jest.fn();
    testFirestoreMock = jest.fn().mockImplementation(
      () => ({
        collection$: collectionFn
      })
    );

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([TestState]),
        NgxsFirestoreModule.forRoot()
      ],
      providers: [
        { provide: TestFirestore, useValue: testFirestoreMock() }
      ]
    }).compileComponents();

    store = TestBed.get(Store);
    actions = TestBed.get(Actions);
  });


  it('EMIT action completes first', fakeAsync(() => {
    const { $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    const actionsCompleted = [];
    actions.pipe(
      ofActionCompleted(GetTestData, GetTestDataEmit)
    ).subscribe(
      actionContext => actionsCompleted.push(getActionTypeFromInstance(actionContext.action.constructor))
    );

    store.dispatch(new GetTestData());
    expect(actionsCompleted).toEqual([]);
    tick(101);

    expect(actionsCompleted).toEqual([GetTestDataEmit.type, GetTestData.type]);
  }));

  it('EMIT action patches store appropiately', fakeAsync(() => {
    const { $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    store.dispatch(new GetTestData());
    tick(101);

    expect(store.selectSnapshot(TestState).items).toEqual(['a', 'b', 'c']);
  }));

  it('keeps listening and updates store on every new emission', fakeAsync(() => {
    const { BS, $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    let actionsCompleted = 0;
    actions.pipe(
      ofActionCompleted(GetTestDataEmit)
    ).subscribe(
      actionContext => actionsCompleted++
    );

    store.dispatch(new GetTestData());
    tick(101);
    expect(store.selectSnapshot(TestState).items).toEqual(['a', 'b', 'c']);

    BS.next(['d']);
    tick(101);
    expect(store.selectSnapshot(TestState).items).toEqual(['d']);
    expect(actionsCompleted).toBe(2);
  }));

  it('action completes after first emission', fakeAsync(() => {
    const { $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    let completed = false;
    actions.pipe(
      ofActionCompleted(GetTestData)
    ).subscribe(_ => {
      completed = true;
    });

    store.dispatch(new GetTestData());
    expect(completed).toBe(false);
    tick(101);
    expect(completed).toBe(true);
  }));

  it('connects only ONCE when action is dispatched multiple times', fakeAsync(() => {
    const { $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    let count = 0;
    actions.pipe(
      ofActionCompleted(GetTestDataEmit)
    ).subscribe(_ => count++);

    store.dispatch(new GetTestData());
    store.dispatch(new GetTestData());
    store.dispatch(new GetTestData());
    store.dispatch(new GetTestData());

    expect(count).toBe(0);
    tick(101);
    expect(count).toBe(1);
  }));

  it('disconnects when calling disconnect action', fakeAsync(() => {
    const { BS, $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    let count = 0;
    actions.pipe(
      ofActionCompleted(GetTestDataEmit)
    ).subscribe(_ => count++);

    store.dispatch(new GetTestData());

    expect(count).toBe(0);
    tick(101);
    expect(count).toBe(1);
    store.dispatch(new GetTestDataDisconnect());
    BS.next(['d']);
    tick(101);
    expect(count).toBe(1);
  }));


  it('disconnects when calling disconnect action with parameter', fakeAsync(() => {
    const { BS, $ } = asyncFirestoreResponse();
    collectionFn.mockReturnValue($);
    let count = 0;
    actions.pipe(
      ofActionCompleted(GetTestDataEmit)
    ).subscribe(_ => count++);

    store.dispatch(new GetTestData());

    expect(count).toBe(0);
    tick(101);
    expect(count).toBe(1);
    store.dispatch(new Disconnect(GetTestData));
    BS.next(['d']);
    tick(101);
    expect(count).toBe(1);
  }));


});
