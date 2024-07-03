import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { ngxsFirestoreConnections } from './ngxs-firestore-connections.selector';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

describe('NGXS Firestore State', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()],
      providers: [provideFirebaseApp(() => initializeApp({})), provideFirestore(() => getFirestore())]
    });

    store = TestBed.inject(Store);
  });

  test('State exists', () => {
    expect(store.selectSnapshot(ngxsFirestoreConnections)).toBeTruthy();
    expect(store.selectSnapshot(ngxsFirestoreConnections)).toEqual([]);
  });
});
