import { TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { NgxsModule, Store } from '@ngxs/store';
import { ngxsFirectoreConnections } from './ngxs-firestore-connections.selector';
import { NgxsFirestoreModule } from './ngxs-firestore.module';

describe('NGXS Firestore State', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([]),
        provideFirebaseApp(() => initializeApp({})),
        provideFirestore(() => getFirestore()),
        NgxsFirestoreModule.forRoot()
      ]
    });

    store = TestBed.get(Store);
  });

  test('State exists', () => {
    expect(store.selectSnapshot(ngxsFirectoreConnections)).toBeTruthy();
  });
});
