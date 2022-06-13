import { TestBed, async } from '@angular/core/testing';
import { RacesFirestore } from './races.firestore';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { Firestore } from '@angular/fire/firestore';

describe('RacesFirestore', () => {
  beforeEach(async(() =>
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()],
      providers: [{ provide: Firestore, useValue: jest.fn() }]
    })));

  it('should be created', () => {
    const service: RacesFirestore = TestBed.get(RacesFirestore);
    expect(service).toBeTruthy();
  });
});
