import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { ngxsFirectoreConnections } from './ngxs-firestore-connections.selector';

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

    store = TestBed.inject(Store);
  });

  test('State exists', () => {
    expect(store.selectSnapshot(ngxsFirectoreConnections)).toBeTruthy();
  });
});
