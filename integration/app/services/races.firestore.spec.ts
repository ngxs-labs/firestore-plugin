import { TestBed, async } from '@angular/core/testing';
import { RacesFirestore } from './races.firestore';
import { NgxsModule } from '@ngxs/store';
import { AngularFirestore } from '@angular/fire/firestore';

describe('RacesFirestore', () => {
  beforeEach(async(() =>
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])],
      providers: [{ provide: AngularFirestore, useValue: jest.fn() }]
    })));

  it('should be created', () => {
    const service: RacesFirestore = TestBed.get(RacesFirestore);
    expect(service).toBeTruthy();
  });
});
