import { TestBed } from '@angular/core/testing';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { Store, NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from './ngxs-firestore.module';

describe('NgxsFirestoreConnect', () => {
    let store;
    let ngxsFirestoreConnect;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()]
        });

        store = TestBed.get(Store);
        ngxsFirestoreConnect = TestBed.get(NgxsFirestoreConnect);
    });

    test('should be provided by module', () => {
        expect(store).toBeTruthy();
        expect(ngxsFirestoreConnect).toBeTruthy();
    });
});
