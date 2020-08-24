import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import {
  Store,
  NgxsModule,
  State,
  NgxsOnInit,
  Action,
  StateContext,
  getActionTypeFromInstance,
  Actions,
  ofActionErrored
} from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { BehaviorSubject, from, Subject, throwError } from 'rxjs';
import { Emitted, Connected, Disconnected } from './types';
import { StreamEmitted, StreamConnected, StreamDisconnected } from './action-decorator-helpers';
import { DisconnectStream, DisconnectAll, Disconnect } from './actions';
import { tap } from 'rxjs/operators';

type EventType = 'emitted' | 'connected' | 'disconnected' | 'action-dispatched' | 'action-completed' | 'action-errored';

describe('NgxsFirestoreConnect', () => {
  let store: Store;
  let actions: Actions;
  let events: EventType[];
  let actionEvents: {
    actionType: string;
    eventType: EventType;
    actionPayload?: any;
  }[];

  const mockFirestoreStream = jest.fn();
  const emittedFn = jest.fn();
  const connectedFn = jest.fn();
  const disconnectedFn = jest.fn();
  class TestAction {
    static type = 'TEST ACTION';
  }

  class TestActionWithPayload {
    static type = 'TEST ACTION WITH PAYLOAD';
    constructor(public payload: string) {}
  }

  class TestActionThatFinishesOnObservableComplete {
    static type = 'TEST ACTION THAT FINISHES ON OBS COMPLETE';
  }

  class TestActionThatFinishesOnFirstEmit {
    static type = 'TEST ACTION THAT FINISHES ON FIRST EMIT';
  }

  class TestActionThatKeepsLast {
    static type = 'TEST ACTION THAT KEEPS LAST';
    constructor(public payload: string) {}
  }

  class TestActionError {
    static type = 'TEST ACTION ERROR';
  }

  @State({
    name: 'test'
  })
  class TestState implements NgxsOnInit {
    constructor(private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

    ngxsOnInit() {
      this.ngxsFirestoreConnect.connect(TestAction, {
        to: mockFirestoreStream
      });

      this.ngxsFirestoreConnect.connect(TestActionWithPayload, {
        to: mockFirestoreStream
      });

      this.ngxsFirestoreConnect.connect(TestActionThatFinishesOnObservableComplete, {
        to: mockFirestoreStream,
        connectedActionFinishesOn: 'StreamCompleted'
      });

      this.ngxsFirestoreConnect.connect(TestActionThatFinishesOnFirstEmit, {
        to: mockFirestoreStream,
        connectedActionFinishesOn: 'FirstEmit'
      });

      this.ngxsFirestoreConnect.connect(TestActionThatKeepsLast, {
        to: mockFirestoreStream,
        cancelPrevious: true
      });

      this.ngxsFirestoreConnect.connect(TestActionError, {
        to: mockFirestoreStream
      });
    }

    @Action([
      StreamEmitted(TestAction),
      StreamEmitted(TestActionWithPayload),
      StreamEmitted(TestActionThatFinishesOnObservableComplete),
      StreamEmitted(TestActionThatFinishesOnFirstEmit),
      StreamEmitted(TestActionThatKeepsLast),
      StreamEmitted(TestActionError)
    ])
    testActionEmitted(ctx: StateContext<any>, { action, payload }: Emitted<any, number>) {
      emittedFn(action);
      events.push('emitted');
      actionEvents.push({
        actionType: getActionTypeFromInstance(action),
        eventType: 'emitted',
        actionPayload: action && action.payload
      });
    }

    @Action([
      StreamConnected(TestAction),
      StreamConnected(TestActionWithPayload),
      StreamConnected(TestActionThatFinishesOnObservableComplete),
      StreamConnected(TestActionThatFinishesOnFirstEmit),
      StreamConnected(TestActionThatKeepsLast),
      StreamConnected(TestActionError)
    ])
    testActionConnected(ctx: StateContext<any>, { action }: Connected<any>) {
      connectedFn(action);
      events.push('connected');
      actionEvents.push({
        actionType: getActionTypeFromInstance(action),
        eventType: 'connected',
        actionPayload: action && action.payload
      });
    }

    @Action([
      StreamDisconnected(TestAction),
      StreamDisconnected(TestActionWithPayload),
      StreamDisconnected(TestActionThatFinishesOnObservableComplete),
      StreamDisconnected(TestActionThatFinishesOnFirstEmit),
      StreamDisconnected(TestActionThatKeepsLast),
      StreamDisconnected(TestActionError)
    ])
    testActionDisconnected(ctx: StateContext<any>, { action }: Disconnected<any>) {
      disconnectedFn(action);
      events.push('disconnected');
      actionEvents.push({
        actionType: getActionTypeFromInstance(action),
        eventType: 'disconnected',
        actionPayload: action && action.payload
      });
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        //
        NgxsModule.forRoot([TestState]),
        NgxsFirestoreModule.forRoot()
      ]
    });
    store = TestBed.get(Store);
    actions = TestBed.get(Actions);
    events = [];
    actionEvents = [];
    mockFirestoreStream.mockImplementation(() => new BehaviorSubject(1).asObservable());
    connectedFn.mockReset();
    emittedFn.mockReset();
    disconnectedFn.mockReset();
  });

  test('should be provided by module', () => {
    expect(TestBed.get(Store)).toBeTruthy();
    expect(TestBed.get(NgxsFirestoreConnect)).toBeTruthy();
  });

  describe('Action', () => {
    let actionReceived;

    beforeEach(() => {
      actionReceived = '';
    });

    describe('Dispatched as Type', () => {
      test('should connect and emit', () => {
        store.dispatch(TestAction);
        expect(events).toEqual(['connected', 'emitted']);
      });

      test('should receive action on connected', () => {
        connectedFn.mockImplementation((action) => {
          actionReceived = getActionTypeFromInstance(action);
        });
        store.dispatch(TestAction);
        expect(actionReceived).toBe(TestAction.type);
      });

      test('should receive action on emitted', () => {
        emittedFn.mockImplementation((action) => {
          actionReceived = getActionTypeFromInstance(action);
        });
        store.dispatch(TestAction);
        expect(actionReceived).toBe(TestAction.type);
      });

      test('should disconnect', () => {
        store.dispatch(TestAction);
        expect(events).toEqual(['connected', 'emitted']);
        store.dispatch(new DisconnectStream(TestAction));
        expect(events).toEqual(['connected', 'emitted', 'disconnected']);
      });

      test('should disconnect with DisconnectAll', () => {
        store.dispatch(TestAction);
        expect(events).toEqual(['connected', 'emitted']);
        store.dispatch(DisconnectAll);
        expect(events).toEqual(['connected', 'emitted', 'disconnected']);
      });
    });
    describe('Dispatched as instance', () => {
      test('should connect and emit', () => {
        store.dispatch(new TestAction());
        expect(events).toEqual(['connected', 'emitted']);
      });

      test('should receive action on connected', () => {
        connectedFn.mockImplementation((action) => {
          actionReceived = getActionTypeFromInstance(action);
        });
        store.dispatch(new TestAction());
        expect(actionReceived).toBe(TestAction.type);
      });

      test('should receive action on emitted', () => {
        emittedFn.mockImplementation((action) => {
          actionReceived = getActionTypeFromInstance(action);
        });
        store.dispatch(new TestAction());
        expect(actionReceived).toBe(TestAction.type);
      });

      test('should disconnect', () => {
        store.dispatch(new TestAction());
        expect(events).toEqual(['connected', 'emitted']);
        store.dispatch(new DisconnectStream(TestAction));
        expect(events).toEqual(['connected', 'emitted', 'disconnected']);
      });

      test('should disconnect with DisconnectAll', () => {
        store.dispatch(new TestAction());
        expect(events).toEqual(['connected', 'emitted']);
        store.dispatch(new DisconnectAll());
        expect(events).toEqual(['connected', 'emitted', 'disconnected']);
      });
    });
  });

  describe('Action With Payload', () => {
    const payload = 'test-payload';

    test('should connect and emit', () => {
      store.dispatch(new TestActionWithPayload(payload));
      expect(events).toEqual(['connected', 'emitted']);
    });

    test('should receive action on connected', () => {
      connectedFn.mockImplementation((action) => {
        expect(getActionTypeFromInstance(action)).toBe(TestActionWithPayload.type);
      });
      store.dispatch(new TestActionWithPayload(payload));
    });

    test('should receive action and payload on emitted', () => {
      emittedFn.mockImplementation((action) => {
        expect(getActionTypeFromInstance(action)).toBe(TestActionWithPayload.type);
      });

      emittedFn.mockImplementation((action) => {
        expect(action.payload).toBe(payload);
      });
      store.dispatch(new TestActionWithPayload(payload));
    });

    test('should disconnect with same payload', () => {
      store.dispatch(new TestActionWithPayload(payload));
      expect(events).toEqual(['connected', 'emitted']);
      store.dispatch(new Disconnect(new TestActionWithPayload(payload)));
      expect(events).toEqual(['connected', 'emitted', 'disconnected']);
    });

    test('should NOT disconnect with other payload', () => {
      store.dispatch(new TestActionWithPayload(payload));
      expect(events).toEqual(['connected', 'emitted']);
      store.dispatch(new Disconnect(new TestActionWithPayload('other')));
      expect(events).toEqual(['connected', 'emitted']);
      expect(events).not.toContain('disconnected');
    });
  });

  describe('Action Completion', () => {
    describe('SYNC', () => {
      beforeEach(() => {
        mockFirestoreStream.mockImplementation(() => from([1, 2, 3]));
      });

      test('should complete on FirstEmit', () => {
        store.dispatch(TestActionThatFinishesOnFirstEmit).subscribe((_) => {
          events.push('action-completed');
        });
        expect(events).toEqual(['connected', 'emitted', 'emitted', 'emitted', 'disconnected', 'action-completed']);
      });

      test('should complete on ObservableComplete', () => {
        store.dispatch(TestActionThatFinishesOnObservableComplete).subscribe((_) => {
          events.push('action-completed');
        });
        expect(events).toEqual(['connected', 'emitted', 'emitted', 'emitted', 'disconnected', 'action-completed']);
      });
    });

    describe('ASYNC', () => {
      let subject;

      beforeEach(() => {
        subject = new Subject();
        mockFirestoreStream.mockImplementation(() => subject.asObservable());
      });

      test('should complete on FirstEmit', fakeAsync(() => {
        store.dispatch(TestActionThatFinishesOnFirstEmit).subscribe((_) => {
          events.push('action-completed');
        });
        tick(1);
        expect(events).toEqual([]);
        subject.next(1);
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'action-completed']);
        subject.next(1);
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'action-completed', 'emitted']);
        subject.next(1);
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'action-completed', 'emitted', 'emitted']);
        subject.complete();
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'action-completed', 'emitted', 'emitted', 'disconnected']);
      }));

      test('should complete on ObservableComplete', fakeAsync(() => {
        store.dispatch(TestActionThatFinishesOnObservableComplete).subscribe((_) => {
          events.push('action-completed');
        });
        tick(1);
        expect(events).toEqual([]);
        subject.next(1);
        tick(1);
        expect(events).toEqual(['connected', 'emitted']);
        subject.next(1);
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'emitted']);
        subject.next(1);
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'emitted', 'emitted']);
        subject.complete();
        tick(1);
        expect(events).toEqual(['connected', 'emitted', 'emitted', 'emitted', 'disconnected', 'action-completed']);
      }));
    });
  });

  describe('Dispatching Action Multiple Times', () => {
    let subject;

    beforeEach(() => {
      subject = new Subject();
      mockFirestoreStream.mockImplementation(() => subject.asObservable());
    });

    describe('With Keep All strategy', () => {
      test('should keep both connections active', fakeAsync(() => {
        store.dispatch(new TestActionWithPayload('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionWithPayload.type,
            eventType: 'action-completed',
            actionPayload: 'first'
          });
        });
        store.dispatch(new TestActionWithPayload('second')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionWithPayload.type,
            eventType: 'action-completed',
            actionPayload: 'second'
          });
        });
        tick(1);
        expect(actionEvents).toEqual([]);
        subject.next(1);
        tick(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionWithPayload.type, eventType: 'connected', actionPayload: 'first' },
          { actionType: TestActionWithPayload.type, eventType: 'emitted', actionPayload: 'first' },
          { actionType: TestActionWithPayload.type, eventType: 'action-completed', actionPayload: 'first' },
          { actionType: TestActionWithPayload.type, eventType: 'connected', actionPayload: 'second' },
          { actionType: TestActionWithPayload.type, eventType: 'emitted', actionPayload: 'second' },
          { actionType: TestActionWithPayload.type, eventType: 'action-completed', actionPayload: 'second' }
        ]);
      }));
    });

    describe('With Keep Latest strategy', () => {
      test('should keep second connection active', fakeAsync(() => {
        store.dispatch(new TestActionThatKeepsLast('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionThatKeepsLast.type,
            eventType: 'action-completed',
            actionPayload: 'first'
          });
        });
        store.dispatch(new TestActionThatKeepsLast('second')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionThatKeepsLast.type,
            eventType: 'action-completed',
            actionPayload: 'second'
          });
        });
        tick(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionThatKeepsLast.type, eventType: 'disconnected', actionPayload: 'first' }
        ]);
        subject.next(1);
        tick(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionThatKeepsLast.type, eventType: 'disconnected', actionPayload: 'first' },
          { actionType: TestActionThatKeepsLast.type, eventType: 'connected', actionPayload: 'second' },
          { actionType: TestActionThatKeepsLast.type, eventType: 'emitted', actionPayload: 'second' },
          {
            actionType: TestActionThatKeepsLast.type,
            eventType: 'action-completed',
            actionPayload: 'second'
          }
        ]);
        subject.next(2);
        tick(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionThatKeepsLast.type, eventType: 'disconnected', actionPayload: 'first' },
          { actionType: TestActionThatKeepsLast.type, eventType: 'connected', actionPayload: 'second' },
          { actionType: TestActionThatKeepsLast.type, eventType: 'emitted', actionPayload: 'second' },
          {
            actionType: TestActionThatKeepsLast.type,
            eventType: 'action-completed',
            actionPayload: 'second'
          },
          { actionType: TestActionThatKeepsLast.type, eventType: 'emitted', actionPayload: 'second' }
        ]);
      }));
    });

    describe('Same action same payload', () => {
      test('all dispatched actions should complete once connected action completes (firstemit)', fakeAsync(() => {
        store.dispatch(new TestActionWithPayload('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionWithPayload.type,
            eventType: 'action-completed',
            actionPayload: '1'
          });
        });
        expect(actionEvents).toEqual([]);
        tick(1);
        expect(actionEvents).toEqual([]);
        store.dispatch(new TestActionWithPayload('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionWithPayload.type,
            eventType: 'action-completed',
            actionPayload: '2'
          });
        });
        expect(actionEvents).toEqual([]);
        tick(1);
        expect(actionEvents).toEqual([]);
        store.dispatch(new TestActionWithPayload('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionWithPayload.type,
            eventType: 'action-completed',
            actionPayload: '3'
          });
        });
        expect(actionEvents).toEqual([]);
        tick(1);
        expect(actionEvents).toEqual([]);
        subject.next(1);
        tick(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionWithPayload.type, eventType: 'connected', actionPayload: 'first' },
          { actionType: TestActionWithPayload.type, eventType: 'emitted', actionPayload: 'first' },
          { actionType: TestActionWithPayload.type, eventType: 'action-completed', actionPayload: '1' },
          { actionType: TestActionWithPayload.type, eventType: 'action-completed', actionPayload: '2' },
          { actionType: TestActionWithPayload.type, eventType: 'action-completed', actionPayload: '3' }
        ]);
      }));
    });

    describe('Dispatch after action is connected', () => {
      test('should complete immediately', fakeAsync(() => {
        store.dispatch(new TestActionThatFinishesOnFirstEmit()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionThatFinishesOnFirstEmit.type,
            eventType: 'action-completed'
          });
        });
        tick(1);
        subject.next(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionThatFinishesOnFirstEmit.type, eventType: 'connected' },
          { actionType: TestActionThatFinishesOnFirstEmit.type, eventType: 'emitted' },
          { actionType: TestActionThatFinishesOnFirstEmit.type, eventType: 'action-completed' }
        ]);

        store.dispatch(new TestActionThatFinishesOnFirstEmit()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionThatFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '2nd dispatch'
          });
        });

        store.dispatch(new TestActionThatFinishesOnFirstEmit()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionThatFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '3rd dispatch'
          });
        });

        expect(actionEvents).toEqual([
          { actionType: TestActionThatFinishesOnFirstEmit.type, eventType: 'connected' },
          { actionType: TestActionThatFinishesOnFirstEmit.type, eventType: 'emitted' },
          { actionType: TestActionThatFinishesOnFirstEmit.type, eventType: 'action-completed' },
          {
            actionType: TestActionThatFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '2nd dispatch'
          },
          {
            actionType: TestActionThatFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '3rd dispatch'
          }
        ]);
      }));
    });
  });

  describe('Error', () => {
    beforeEach(() => {
      mockFirestoreStream.mockImplementation(() => throwError('test error'));
    });

    test('should disconnect before completion', () => {
      actions
        .pipe(
          ofActionErrored(TestActionError),
          tap(() => {
            events.push('action-errored');
          })
        )
        .subscribe();
      store.dispatch(TestActionError).subscribe((_) => {
        events.push('action-completed');
      });
      expect(events).toEqual(['action-errored', 'disconnected']);
    });
  });
});
