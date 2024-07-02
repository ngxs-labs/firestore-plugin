import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { ngxsFirestoreConnections } from './ngxs-firestore-connections.selector';

describe('NGXS Firestore State', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()]
    });

    store = TestBed.inject(Store);
  });

  test('State exists', () => {
    expect(store.selectSnapshot(ngxsFirestoreConnections)).toBeTruthy();
    expect(store.selectSnapshot(ngxsFirestoreConnections)).toEqual([]);
  });
});
