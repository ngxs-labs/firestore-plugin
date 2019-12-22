import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { RacesState } from './races.state';
import { RacesActions } from './races.actions';
import { RacesFirestore } from 'integration/app/services/races.firestore';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { BehaviorSubject } from 'rxjs';
import { Race } from 'integration/app/models/race';

describe('Races State', () => {
  let store: Store;
  let mockRacesFS;
  let mockCollection$: jest.Mock;

  beforeEach(async(() => {
    mockRacesFS = jest.fn(() => ({
      collection$: mockCollection$
    }));

    mockCollection$ = jest.fn();

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([RacesState]),
        NgxsFirestoreModule.forRoot()
      ],
      providers: [
        { provide: RacesFirestore, useValue: mockRacesFS() }
      ]
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  it('should getall races', () => {
    mockCollection$.mockReturnValue(new BehaviorSubject([{ id: 'a' }]));
    store.dispatch(new RacesActions.GetAll());
    expect(store.selectSnapshot(RacesState.races)).toEqual([{ id: 'a' } as Race]);
  });

});
