import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { NgxsFirestoreActions } from './ngxs-firestore.actions';

describe('NGXS Firestore State', () => {
  let store: Store;
  const activeConnections = () => {
    return store.selectSnapshot(NgxsFirestoreState).activeConnections;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([NgxsFirestoreState])
      ]
    }).compileComponents();

    store = TestBed.get(Store);


  }));

  it('should create an action and add an item', () => {
    expect(activeConnections()).toBe(0);
    store.dispatch(new NgxsFirestoreActions.IncrementCount({ prop: 'activeConnections' }));
    expect(activeConnections()).toBe(1);
  });

});
