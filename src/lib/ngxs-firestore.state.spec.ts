import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { AngularFireModule } from '@angular/fire';

describe('NGXS Firestore State', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AngularFireModule.initializeApp({}), NgxsFirestoreModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  test('State exists', () => {
    expect(store.selectSnapshot(NgxsFirestoreState.connections)).toBeTruthy();
  });
});
