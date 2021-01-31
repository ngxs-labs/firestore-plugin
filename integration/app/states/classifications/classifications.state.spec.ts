import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { ClassificationsState } from './classifications.state';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { BehaviorSubject } from 'rxjs';
import { ClassificationsActions } from './classifications.actions';
import { Classification } from 'integration/app/models/classification';

describe('Classifications State', () => {
  let store: Store;
  let mockClassificationsFS;
  let mockCollection$: jest.Mock;

  beforeEach(async(() => {
    mockClassificationsFS = jest.fn(() => ({
      collection$: mockCollection$
    }));

    mockCollection$ = jest.fn();

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ClassificationsState]), NgxsFirestoreModule.forRoot()],
      providers: [{ provide: ClassificationsState, useValue: mockClassificationsFS() }]
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  it('should getall classifications', () => {
    mockCollection$.mockReturnValue(new BehaviorSubject([{ id: 'a' }]));
    store.dispatch(new ClassificationsActions.GetAll());
    expect(store.selectSnapshot(ClassificationsState.classifications)).toEqual([{ id: 'a' } as Classification]);
  });
});
