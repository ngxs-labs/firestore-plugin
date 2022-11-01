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
  ofActionErrored,
  ofActionCompleted
} from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { BehaviorSubject, from, Subject, throwError } from 'rxjs';
import { Emitted, Connected, Disconnected, Errored } from './types';
import { StreamEmitted, StreamConnected, StreamDisconnected, StreamErrored } from './action-decorator-helpers';
import { DisconnectAll, Disconnect } from './actions';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

type EventType =
  | 'emitted'
  | 'connected'
  | 'disconnected'
  | 'action-dispatched'
  | 'action-completed'
  | 'action-errored'
  | 'errored';

type ActionEvent = {
  actionType: string;
  eventType: EventType;
  actionPayload?: any;
  actionError?: any;
};

describe('NgxsFirestoreConnect', () => {
  let store: Store;
  let actions: Actions;
  let events: EventType[];
  let actionEvents: ActionEvent[];

  const mockFirestoreStream = jest.fn();
  const emittedFn = jest.fn();
  const connectedFn = jest.fn();
  const disconnectedFn = jest.fn();
  const erroredFn = jest.fn();
  class TestAction {
    static type = 'TEST ACTION';
  }

  class TestActionWithPayload {
    static type = 'TEST ACTION WITH PAYLOAD';
    constructor(public payload: string) {}
  }

  class TestActionFinishesOnStreamCompleted {
    static type = 'TEST ACTION THAT FINISHES ON STREAM COMPLETED';
  }

  class TestActionFinishesOnFirstEmit {
    static type = 'TEST ACTION THAT FINISHES ON FIRST EMIT';
  }

  class TestActionTrackByIdCancelPrevious {
    static type = 'TEST ACTION THAT KEEPS LAST';
    constructor(public payload: string) {}
  }

  class TestActionCancelPrevious {
    static type = 'TEST ACTION THAT KEEPS LAST WITHOUT PAYLOAD';
  }

  class TestActionError {
    static type = 'TEST ACTION ERROR';
  }

  @State({
    name: 'test'
  })
  @Injectable()
  class TestState implements NgxsOnInit {
    constructor(private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

    ngxsOnInit() {
      this.ngxsFirestoreConnect.connect(TestAction, {
        to: mockFirestoreStream
      });

      this.ngxsFirestoreConnect.connect(TestActionWithPayload, {
        to: mockFirestoreStream,
        trackBy: (action) => action.payload
      });

      this.ngxsFirestoreConnect.connect(TestActionFinishesOnStreamCompleted, {
        to: mockFirestoreStream,
        connectedActionFinishesOn: 'StreamCompleted'
      });

      this.ngxsFirestoreConnect.connect(TestActionFinishesOnFirstEmit, {
        to: mockFirestoreStream,
        connectedActionFinishesOn: 'FirstEmit'
      });

      this.ngxsFirestoreConnect.connect(TestActionTrackByIdCancelPrevious, {
        to: mockFirestoreStream,
        trackBy: (action) => action.payload,
        cancelPrevious: true
      });

      this.ngxsFirestoreConnect.connect(TestActionCancelPrevious, {
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
      StreamEmitted(TestActionFinishesOnStreamCompleted),
      StreamEmitted(TestActionFinishesOnFirstEmit),
      StreamEmitted(TestActionTrackByIdCancelPrevious),
      StreamEmitted(TestActionCancelPrevious),
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
      StreamConnected(TestActionFinishesOnStreamCompleted),
      StreamConnected(TestActionFinishesOnFirstEmit),
      StreamConnected(TestActionTrackByIdCancelPrevious),
      StreamConnected(TestActionCancelPrevious),
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
      StreamDisconnected(TestActionFinishesOnStreamCompleted),
      StreamDisconnected(TestActionFinishesOnFirstEmit),
      StreamDisconnected(TestActionTrackByIdCancelPrevious),
      StreamDisconnected(TestActionCancelPrevious),
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

    @Action([
      StreamErrored(TestAction),
      StreamErrored(TestActionWithPayload),
      StreamErrored(TestActionFinishesOnStreamCompleted),
      StreamErrored(TestActionFinishesOnFirstEmit),
      StreamErrored(TestActionTrackByIdCancelPrevious),
      StreamErrored(TestActionCancelPrevious),
      StreamErrored(TestActionError)
    ])
    testActionErrored(ctx: StateContext<any>, { action, error }: Errored<any>) {
      erroredFn(action);
      events.push('errored');
      actionEvents.push({
        actionType: getActionTypeFromInstance(action),
        eventType: 'errored',
        actionError: error
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
    store = TestBed.inject(Store);
    actions = TestBed.inject(Actions);
    events = [];
    actionEvents = [];
    mockFirestoreStream.mockImplementation(() => new BehaviorSubject(1).asObservable());
    connectedFn.mockReset();
    emittedFn.mockReset();
    disconnectedFn.mockReset();
  });

  test('should be provided by module', () => {
    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(NgxsFirestoreConnect)).toBeTruthy();
  });

  describe('NgxsFirestoreConnect', () => {
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
        store.dispatch(new Disconnect(new TestAction()));
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
        store.dispatch(new Disconnect(new TestAction()));
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
        store.dispatch(TestActionFinishesOnFirstEmit).subscribe((_) => {
          events.push('action-completed');
        });
        expect(events).toEqual(['connected', 'emitted', 'emitted', 'emitted', 'disconnected', 'action-completed']);
      });

      test('should complete on StreamCompleted', () => {
        store.dispatch(TestActionFinishesOnStreamCompleted).subscribe((_) => {
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
        store.dispatch(TestActionFinishesOnFirstEmit).subscribe((_) => {
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

      test('should complete on StreamCompleted', fakeAsync(() => {
        store.dispatch(TestActionFinishesOnStreamCompleted).subscribe((_) => {
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

  describe('Multiple Action Dispatch Handling', () => {
    let subject;

    beforeEach(() => {
      subject = new Subject();
      mockFirestoreStream.mockImplementation(() => subject.asObservable());
    });

    describe('cancelPrevious: false', () => {
      test('different trackBy id should keep both connections active', fakeAsync(() => {
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

    describe('cancelPrevious: true', () => {
      test('different trackBy id should disconnect prior connection of same id', fakeAsync(() => {
        store.dispatch(new TestActionTrackByIdCancelPrevious('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionTrackByIdCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'first'
          });
        });
        store.dispatch(new TestActionTrackByIdCancelPrevious('second')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionTrackByIdCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'second'
          });
        });
        tick(1);
        expect(actionEvents).toEqual([]);
        subject.next(1);
        tick(1);
        const firstExpect: ActionEvent[] = [
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'connected', actionPayload: 'first' },
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'emitted', actionPayload: 'first' },
          {
            actionType: TestActionTrackByIdCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'first'
          },
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'connected', actionPayload: 'second' },
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'emitted', actionPayload: 'second' },
          {
            actionType: TestActionTrackByIdCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'second'
          }
        ];
        expect(actionEvents).toEqual(firstExpect);
        subject.next(2);
        tick(1);
        const secondExpect: ActionEvent[] = [
          ...firstExpect,
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'emitted', actionPayload: 'first' },
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'emitted', actionPayload: 'second' }
        ];
        expect(actionEvents).toEqual(secondExpect);
        store.dispatch(new TestActionTrackByIdCancelPrevious('first')).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionTrackByIdCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'first'
          });
        });
        tick(1);
        expect(actionEvents).toEqual([
          ...secondExpect,
          { actionType: TestActionTrackByIdCancelPrevious.type, eventType: 'disconnected', actionPayload: 'first' }
        ]);
      }));

      test('should disconnect prior connection (trackBy undefined)', fakeAsync(() => {
        store.dispatch(new TestActionCancelPrevious()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'firstDispatch'
          });
        });
        subject.next(1);
        tick(1);
        const firstExpect: ActionEvent[] = [
          { actionType: TestActionCancelPrevious.type, eventType: 'connected', actionPayload: undefined },
          { actionType: TestActionCancelPrevious.type, eventType: 'emitted', actionPayload: undefined },
          {
            actionType: TestActionCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'firstDispatch'
          }
        ];
        expect(actionEvents).toEqual(firstExpect);

        store.dispatch(new TestActionCancelPrevious()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'secondDispatch'
          });
        });
        subject.next(1);
        tick(1);

        expect(actionEvents).toEqual([
          ...firstExpect,
          {
            actionType: TestActionCancelPrevious.type,
            eventType: 'disconnected',
            actionPayload: undefined
          },
          { actionType: TestActionCancelPrevious.type, eventType: 'connected', actionPayload: undefined },
          { actionType: TestActionCancelPrevious.type, eventType: 'emitted', actionPayload: undefined },
          {
            actionType: TestActionCancelPrevious.type,
            eventType: 'action-completed',
            actionPayload: 'secondDispatch'
          }
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
        store.dispatch(new TestActionFinishesOnFirstEmit()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionFinishesOnFirstEmit.type,
            eventType: 'action-completed'
          });
        });
        tick(1);
        subject.next(1);
        expect(actionEvents).toEqual([
          { actionType: TestActionFinishesOnFirstEmit.type, eventType: 'connected' },
          { actionType: TestActionFinishesOnFirstEmit.type, eventType: 'emitted' },
          { actionType: TestActionFinishesOnFirstEmit.type, eventType: 'action-completed' }
        ]);

        store.dispatch(new TestActionFinishesOnFirstEmit()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '2nd dispatch'
          });
        });

        store.dispatch(new TestActionFinishesOnFirstEmit()).subscribe((_) => {
          actionEvents.push({
            actionType: TestActionFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '3rd dispatch'
          });
        });

        expect(actionEvents).toEqual([
          { actionType: TestActionFinishesOnFirstEmit.type, eventType: 'connected' },
          { actionType: TestActionFinishesOnFirstEmit.type, eventType: 'emitted' },
          { actionType: TestActionFinishesOnFirstEmit.type, eventType: 'action-completed' },
          {
            actionType: TestActionFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '2nd dispatch'
          },
          {
            actionType: TestActionFinishesOnFirstEmit.type,
            eventType: 'action-completed',
            actionPayload: '3rd dispatch'
          }
        ]);
      }));
    });
  });

  describe('Error', () => {
    describe('before connected to stream', () => {
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

        actions
          .pipe(
            ofActionCompleted(TestActionError),
            tap(() => {
              events.push('action-completed');
            })
          )
          .subscribe();

        store.dispatch(TestActionError);
        expect(events).toEqual(['action-errored', 'action-completed', 'errored', 'disconnected']);
      });
    });

    describe('after connected to stream', () => {
      let subject: Subject<number>;

      beforeEach(() => {
        subject = new Subject();
        mockFirestoreStream.mockImplementation(() => subject.asObservable());
      });

      test('should disconnect before completion', fakeAsync(() => {
        actions
          .pipe(
            ofActionErrored(TestActionError),
            tap(() => {
              events.push('action-errored');
            })
          )
          .subscribe();

        actions
          .pipe(
            ofActionCompleted(TestActionError),
            tap(() => {
              events.push('action-completed');
            })
          )
          .subscribe();

        store.dispatch(TestActionError);

        subject.next(1);
        tick();

        expect(events).toEqual(['connected', 'emitted', 'action-completed']);

        subject.error('test error');
        tick();
        tick();

        expect(events).toEqual(['connected', 'emitted', 'action-completed', 'errored', 'disconnected']);

        expect(actionEvents).toEqual([
          { actionType: TestActionError.type, eventType: 'connected', actionPayload: undefined },
          { actionType: TestActionError.type, eventType: 'emitted', actionPayload: undefined },
          { actionType: TestActionError.type, eventType: 'errored', actionError: 'test error' },
          { actionType: TestActionError.type, eventType: 'disconnected', actionPayload: undefined }
        ]);
      }));
    });
  });
});
