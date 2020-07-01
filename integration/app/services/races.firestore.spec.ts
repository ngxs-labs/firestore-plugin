import { TestBed, async } from '@angular/core/testing';
import { RacesFirestore } from './races.firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';

describe('RacesFirestore', () => {
  beforeEach(async(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: jest.fn() },
        { provide: Store, useValue: jest.fn() }
      ]
    })));

  it('should be created', () => {
    const service: RacesFirestore = TestBed.get(RacesFirestore);
    expect(service).toBeTruthy();
  });
});
