import { TestBed, fakeAsync } from '@angular/core/testing';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { Store, NgxsModule, State, NgxsOnInit, Action, StateContext } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { from } from 'rxjs';
import { Emitted } from './types';
import { StreamEmitted } from './action-decorator-helpers';

describe('NgxsFirestoreConnect', () => {
    let store: Store;

    const mockFirestoreStream = from([1]);
    class TestAction {
        static type = 'TEST ACTION';
    }

    @State({
        name: 'test'
    })
    class TestState implements NgxsOnInit {
        constructor(private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

        ngxsOnInit() {
            this.ngxsFirestoreConnect.connect(TestAction, {
                to: () => mockFirestoreStream
            });
        }

        @Action(StreamEmitted(TestAction))
        testAction(ctx: StateContext<any>, { payload }: Emitted<TestAction, number>) {
            ctx.patchState({ number: payload });
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([TestState]), NgxsFirestoreModule.forRoot()]
        });
        store = TestBed.get(Store);
    });

    test('should be provided by module', () => {
        expect(TestBed.get(Store)).toBeTruthy();
        expect(TestBed.get(NgxsFirestoreConnect)).toBeTruthy();
    });

    test('', fakeAsync(() => {
        store.dispatch(TestAction);
        expect(store.selectSnapshot(TestState).number).toBe(1);
    }));
});
