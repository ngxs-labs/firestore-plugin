import { TestBed } from '@angular/core/testing';
import { RacesFirestore } from './races.firestore';

describe('RacesFirestore', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RacesFirestore = TestBed.get(RacesFirestore);
    expect(service).toBeTruthy();
  });
});
