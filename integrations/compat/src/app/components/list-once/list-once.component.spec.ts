import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOnceComponent } from './list-once.component';
import { Store, NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin/compat';
import { Subject } from 'rxjs';

describe('ListOnceComponent', () => {
  let component: ListOnceComponent;
  let fixture: ComponentFixture<ListOnceComponent>;
  let storeMock;

  beforeEach(async(() => {
    storeMock = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnValue(new Subject()),
      dispatch: jest.fn().mockReturnValue(new Subject())
    }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), NgxsFirestoreModule.forRoot()],
      declarations: [ListOnceComponent],
      providers: [{ provide: Store, useValue: storeMock() }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOnceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
