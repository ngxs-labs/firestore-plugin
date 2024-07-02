import { TestBed, waitForAsync } from '@angular/core/testing';
import { RacesFirestore } from './races.firestore';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { AngularFirestore } from '@angular/fire/compat/firestore';

describe('RacesFirestore', () => {
  beforeEach(
    waitForAsync(() =>
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()],
        providers: [{ provide: AngularFirestore, useValue: jest.fn() }]
      })
    )
  );

  it('should be created', () => {
    const service: RacesFirestore = TestBed.inject(RacesFirestore);
    expect(service).toBeTruthy();
  });
});
