import { TestBed, fakeAsync } from '@angular/core/testing';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { Store, NgxsModule, State, NgxsOnInit, Action, StateContext, getActionTypeFromInstance } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { BehaviorSubject } from 'rxjs';
import { Emitted, Connected, Disconnected } from './types';
import { StreamEmitted, StreamConnected, StreamDisconnected } from './action-decorator-helpers';

describe('NgxsFirestoreConnect', () => {
    let store: Store;
    let events: ('emmited' | 'connected' | 'disconnected')[];

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
        }

        @Action(StreamEmitted(TestAction))
        testActionEmitted(ctx: StateContext<any>, { action, payload }: Emitted<TestAction, number>) {
            emittedFn(action);
            events.push('emmited');
        }

        @Action(StreamConnected(TestAction))
        testActionConnected(ctx: StateContext<any>, { action }: Connected<TestAction>) {
            connectedFn(action);
            events.push('connected');
        }

        @Action(StreamDisconnected(TestAction))
        testActionDisconnected(ctx: StateContext<any>, { action }: Disconnected<TestAction>) {
            disconnectedFn(action);
            events.push('disconnected');
        }

        @Action(StreamEmitted(TestActionWithPayload))
        testActionWithPayloadEmitted(
            ctx: StateContext<any>,
            { action, payload }: Emitted<TestActionWithPayload, number>
        ) {
            emittedFn(action);
            events.push('emmited');
        }

        @Action(StreamConnected(TestActionWithPayload))
        testActionWithPayloadConnected(ctx: StateContext<any>, { action }: Connected<TestActionWithPayload>) {
            connectedFn(action);
            events.push('connected');
        }

        @Action(StreamDisconnected(TestActionWithPayload))
        testActionWithPayloadDisconnected(ctx: StateContext<any>, { action }: Disconnected<TestActionWithPayload>) {
            disconnectedFn(action);
            events.push('disconnected');
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([TestState]), NgxsFirestoreModule.forRoot()]
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
        describe('Dispatched as Type', () => {
            test('should connect and emit', fakeAsync(() => {
                store.dispatch(TestAction);
                expect(events).toEqual(['connected', 'emmited']);
            }));

            test('should receive action on connected', fakeAsync(() => {
                connectedFn.mockImplementation((action) => {
                    expect(getActionTypeFromInstance(action)).toBe(TestAction.type);
                });
                store.dispatch(TestAction);
            }));

            test('should receive action on emitted', fakeAsync(() => {
                emittedFn.mockImplementation((action) => {
                    expect(getActionTypeFromInstance(action)).toBe(TestAction.type);
                });
                store.dispatch(TestAction);
            }));
        });
        describe('Dispatched as instance', () => {
            test('should connect and emit', fakeAsync(() => {
                store.dispatch(TestAction);
                expect(events).toEqual(['connected', 'emmited']);
            }));

            test('should receive action on connected', fakeAsync(() => {
                connectedFn.mockImplementation((action) => {
                    expect(getActionTypeFromInstance(action)).toBe(TestAction.type);
                });
                store.dispatch(TestAction);
            }));

            test('should receive action on emitted', fakeAsync(() => {
                emittedFn.mockImplementation((action) => {
                    expect(getActionTypeFromInstance(action)).toBe(TestAction.type);
                });
                store.dispatch(TestAction);
            }));
        });
    });

    describe('Action With Payload', () => {
        const payload = 'test-payload';

        test('should connect and emit', fakeAsync(() => {
            store.dispatch(new TestActionWithPayload(payload));
            expect(events).toEqual(['connected', 'emmited']);
        }));

        test('should receive action on connected', fakeAsync(() => {
            connectedFn.mockImplementation((action) => {
                expect(getActionTypeFromInstance(action)).toBe(TestActionWithPayload.type);
            });
            store.dispatch(new TestActionWithPayload(payload));
        }));

        test('should receive action and payload on emitted', fakeAsync(() => {
            emittedFn.mockImplementation((action) => {
                expect(getActionTypeFromInstance(action)).toBe(TestActionWithPayload.type);
            });

            emittedFn.mockImplementation((action) => {
                expect(action.payload).toBe(payload);
            });
            store.dispatch(new TestActionWithPayload(payload));
        }));
    });
});
