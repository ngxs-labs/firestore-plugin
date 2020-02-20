import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { NgxsFirestoreDebugActions } from './ngxs-firestore.actions';

describe('NGXS Firestore State', () => {
    let store: Store;
    const connections = () => {
        return store.selectSnapshot(NgxsFirestoreState).connections;
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([NgxsFirestoreState])]
        }).compileComponents();

        store = TestBed.get(Store);
    }));

    it('should add connection', () => {
        expect(connections().length).toBe(0);
        store.dispatch(new NgxsFirestoreDebugActions.AddConnection('[TEST]'));
        expect(connections()[0]).toBe('[TEST]');
    });
});
