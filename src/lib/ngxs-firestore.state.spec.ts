import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';

describe('NGXS Firestore State', () => {
    let store: Store;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([NgxsFirestoreState])]
        }).compileComponents();

        store = TestBed.get(Store);
    }));
});
