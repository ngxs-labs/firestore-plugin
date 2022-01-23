import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { AngularFireModule } from '@angular/fire/compat';
import { ngxsFirectoreConnections } from './ngxs-firestore-connections.selector';

describe('NGXS Firestore State', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AngularFireModule.initializeApp({}), NgxsFirestoreModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  test('State exists', () => {
    expect(store.selectSnapshot(ngxsFirectoreConnections)).toBeTruthy();
  });
});
