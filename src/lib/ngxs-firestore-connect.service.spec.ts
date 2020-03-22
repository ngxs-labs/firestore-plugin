import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { Store, NgxsModule, State, NgxsOnInit, Action, StateContext, getActionTypeFromInstance } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { BehaviorSubject, from, Subject } from 'rxjs';
import { Emitted, Connected, Disconnected } from './types';
import { StreamEmitted, StreamConnected, StreamDisconnected } from './action-decorator-helpers';
import { DisconnectStream, DisconnectAll, Disconnect } from './actions';

describe('NgxsFirestoreConnect', () => {
    let store: Store;
    let events: ('emmited' | 'connected' | 'disconnected' | 'action-dispatched' | 'action-completed')[];

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
        }

        @Action([
            StreamEmitted(TestAction),
            StreamEmitted(TestActionWithPayload),
            StreamEmitted(TestActionThatFinishesOnObservableComplete),
            StreamEmitted(TestActionThatFinishesOnFirstEmit)
        ])
        testActionEmitted(ctx: StateContext<any>, { action, payload }: Emitted<TestAction, number>) {
            emittedFn(action);
            events.push('emmited');
        }

        @Action([
            StreamConnected(TestAction),
            StreamConnected(TestActionWithPayload),
            StreamConnected(TestActionThatFinishesOnObservableComplete),
            StreamConnected(TestActionThatFinishesOnFirstEmit)
        ])
        testActionConnected(ctx: StateContext<any>, { action }: Connected<TestAction>) {
            connectedFn(action);
            events.push('connected');
        }

        @Action([
            StreamDisconnected(TestAction),
            StreamDisconnected(TestActionWithPayload),
            StreamDisconnected(TestActionThatFinishesOnObservableComplete),
            StreamDisconnected(TestActionThatFinishesOnFirstEmit)
        ])
        testActionDisconnected(ctx: StateContext<any>, { action }: Disconnected<TestAction>) {
            disconnectedFn(action);
            events.push('disconnected');
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
        events = [];
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
                expect(events).toEqual(['connected', 'emmited']);
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
                expect(events).toEqual(['connected', 'emmited']);
                store.dispatch(new DisconnectStream(TestAction));
                expect(events).toEqual(['connected', 'emmited', 'disconnected']);
            });

            test('should disconnect with DisconnectAll', () => {
                store.dispatch(TestAction);
                expect(events).toEqual(['connected', 'emmited']);
                store.dispatch(DisconnectAll);
                expect(events).toEqual(['connected', 'emmited', 'disconnected']);
            });
        });
        describe('Dispatched as instance', () => {
            test('should connect and emit', () => {
                store.dispatch(new TestAction());
                expect(events).toEqual(['connected', 'emmited']);
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
                expect(events).toEqual(['connected', 'emmited']);
                store.dispatch(new DisconnectStream(TestAction));
                expect(events).toEqual(['connected', 'emmited', 'disconnected']);
            });

            test('should disconnect with DisconnectAll', () => {
                store.dispatch(new TestAction());
                expect(events).toEqual(['connected', 'emmited']);
                store.dispatch(new DisconnectAll());
                expect(events).toEqual(['connected', 'emmited', 'disconnected']);
            });
        });
    });

    describe('Action With Payload', () => {
        const payload = 'test-payload';

        test('should connect and emit', () => {
            store.dispatch(new TestActionWithPayload(payload));
            expect(events).toEqual(['connected', 'emmited']);
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
            expect(events).toEqual(['connected', 'emmited']);
            store.dispatch(new Disconnect(new TestActionWithPayload(payload)));
            expect(events).toEqual(['connected', 'emmited', 'disconnected']);
        });

        test('should NOT disconnect with other payload', () => {
            store.dispatch(new TestActionWithPayload(payload));
            expect(events).toEqual(['connected', 'emmited']);
            store.dispatch(new Disconnect(new TestActionWithPayload('other')));
            expect(events).toEqual(['connected', 'emmited']);
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
                expect(events).toEqual([
                    'connected',
                    'emmited',
                    'emmited',
                    'emmited',
                    'disconnected',
                    'action-completed'
                ]);
            });

            test('should complete on ObservableComplete', () => {
                store.dispatch(TestActionThatFinishesOnObservableComplete).subscribe((_) => {
                    events.push('action-completed');
                });
                expect(events).toEqual([
                    'connected',
                    'emmited',
                    'emmited',
                    'emmited',
                    'disconnected',
                    'action-completed'
                ]);
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
                expect(events).toEqual(['connected', 'action-completed', 'emmited']);
                subject.next(1);
                tick(1);
                expect(events).toEqual(['connected', 'action-completed', 'emmited', 'emmited']);
                subject.next(1);
                tick(1);
                expect(events).toEqual(['connected', 'action-completed', 'emmited', 'emmited', 'emmited']);
                subject.complete();
                tick(1);
                expect(events).toEqual([
                    'connected',
                    'action-completed',
                    'emmited',
                    'emmited',
                    'emmited',
                    'disconnected'
                ]);
            }));

            test('should complete on ObservableComplete', fakeAsync(() => {
                store.dispatch(TestActionThatFinishesOnObservableComplete).subscribe((_) => {
                    events.push('action-completed');
                });
                tick(1);
                expect(events).toEqual([]);
                subject.next(1);
                tick(1);
                expect(events).toEqual(['connected', 'emmited']);
                subject.next(1);
                tick(1);
                expect(events).toEqual(['connected', 'emmited', 'emmited']);
                subject.next(1);
                tick(1);
                expect(events).toEqual(['connected', 'emmited', 'emmited', 'emmited']);
                subject.complete();
                tick(1);
                expect(events).toEqual([
                    'connected',
                    'emmited',
                    'emmited',
                    'emmited',
                    'disconnected',
                    'action-completed'
                ]);
            }));
        });
    });

    describe('Dispatching Action Multiple Times', () => {});
});
