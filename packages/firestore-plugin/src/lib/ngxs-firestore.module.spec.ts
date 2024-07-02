import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsFirestoreModule } from './ngxs-firestore.module';

describe('NgxsFirestoreModule', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NgxsFirestoreModule]
      });
    })
  );

  it('should create', () => {
    expect(NgxsFirestoreModule).toBeDefined();
  });
});
