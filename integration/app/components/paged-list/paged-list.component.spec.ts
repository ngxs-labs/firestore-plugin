import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsModule } from '@ngxs/store';

import { PagedListComponent } from './paged-list.component';

describe('PagedListComponent', () => {
  let component: PagedListComponent;
  let fixture: ComponentFixture<PagedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), NgxsFirestoreModule.forRoot()],
      declarations: [PagedListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
