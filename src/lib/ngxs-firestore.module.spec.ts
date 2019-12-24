import { async, TestBed } from '@angular/core/testing';
import { NgxsFirestoreModule } from './ngxs-firestore.module';

describe('NgxsFirestoreModule', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxsFirestoreModule]
        }).compileComponents();
    }));

    it('should create', () => {
        expect(NgxsFirestoreModule).toBeDefined();
    });
});
