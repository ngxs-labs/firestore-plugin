import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListComponent } from './list.component';
import { Store, NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { Subject } from 'rxjs';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let storeMock;

  beforeEach(async(() => {
    storeMock = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnValue(new Subject()),
      dispatch: jest.fn().mockReturnValue(new Subject())
    }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), NgxsFirestoreModule.forRoot()],
      declarations: [ListComponent],
      providers: [{ provide: Store, useValue: storeMock() }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
