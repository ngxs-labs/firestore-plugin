import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { Store, NgxsModule, State, NgxsOnInit, Action, StateContext, getActionTypeFromInstance } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { BehaviorSubject, Subject } from 'rxjs';
import { Emitted, Connected, Disconnected, Errored } from './types';
import { StreamEmitted, StreamConnected, StreamDisconnected, StreamErrored } from './action-decorator-helpers';
import { Injectable } from '@angular/core';
import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';

type EventType =
  | 'emitted'
  | 'connected'
  | 'disconnected'
  | 'action-dispatched'
  | 'action-completed'
  | 'action-errored'
  | 'errored';

type ActionEvent = {
  actionType: string | undefined;
  eventType: EventType;
  actionPayload?: any;
  actionError?: any;
};

describe('NgxsFirestoreConnect', () => {
  let store: Store;
  let events: EventType[];
  let actionEvents: ActionEvent[];

  const mockFirestoreStream = jest.fn();
  const emittedFn = jest.fn();
  const connectedFn = jest.fn();
  const disconnectedFn = jest.fn();
  const erroredFn = jest.fn();

  class TestActionFinishesOnStreamCompleted {
    static type = 'TEST ACTION THAT FINISHES ON STREAM COMPLETED';
  }

  class TestActionFinishesOnFirstEmit {
    static type = 'TEST ACTION THAT FINISHES ON FIRST EMIT';
  }

  @State({
    name: 'test'
  })
  @Injectable()
  class TestState implements NgxsOnInit {
    constructor(private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

    ngxsOnInit() {
      this.ngxsFirestoreConnect.connect(TestActionFinishesOnStreamCompleted, {
        to: mockFirestoreStream,
        connectedActionFinishesOn: 'StreamCompleted'
      });

      this.ngxsFirestoreConnect.connect(TestActionFinishesOnFirstEmit, {
        to: mockFirestoreStream,
        connectedActionFinishesOn: 'FirstEmit'
      });
    }

    @Action([StreamEmitted(TestActionFinishesOnStreamCompleted), StreamEmitted(TestActionFinishesOnFirstEmit)])
    testActionEmitted(ctx: StateContext<any>, { action, payload }: Emitted<any, number>) {
      emittedFn(action);
      events.push('emitted');
      actionEvents.push({
        actionType: getActionTypeFromInstance(action),
        eventType: 'emitted',
        actionPayload: action && action.payload
      });
    }

    @Action([StreamConnected(TestActionFinishesOnStreamCompleted), StreamConnected(TestActionFinishesOnFirstEmit)])
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
      StreamDisconnected(TestActionFinishesOnStreamCompleted),
      StreamDisconnected(TestActionFinishesOnFirstEmit)
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

    @Action([StreamErrored(TestActionFinishesOnStreamCompleted), StreamErrored(TestActionFinishesOnFirstEmit)])
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

  describe('Action Completion', () => {
    describe('ASYNC', () => {
      let subject: Subject<number>;

      // moved this test from service.spec.ts
      // TestBed.configureTestingModule was being run only once (on first describe)
      // and we couldnt reproduce the issue with attachAction
      // where the handler was not being bound to the action hydration and hence
      // not completing the action correctly (meaning it was always completing synchronously)
      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [
            NgxsModule.forRoot([]),
            NgxsModule.forFeature([TestState]),
            NgxsFirestoreModule.forRoot(),
            NgxsActionsExecutingModule
          ]
        });
        store = TestBed.inject(Store);

        events = [];
        actionEvents = [];
        mockFirestoreStream.mockImplementation(() => new BehaviorSubject(1).asObservable());
        connectedFn.mockReset();
        emittedFn.mockReset();
        disconnectedFn.mockReset();

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
});
