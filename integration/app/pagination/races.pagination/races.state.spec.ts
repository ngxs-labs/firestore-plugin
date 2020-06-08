import { async, TestBed } from '@angular/core/testing';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsModule, Store } from '@ngxs/store';
import { RacesFirestore } from 'integration/app/services/races.firestore';
import { PaginationRacesState } from './races.state';

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
            imports: [NgxsModule.forRoot([PaginationRacesState]), NgxsFirestoreModule.forRoot()],
            providers: [{ provide: RacesFirestore, useValue: mockRacesFS() }]
        }).compileComponents();
        store = TestBed.get(Store);
    }));

    it('should getall races', () => {});
});
