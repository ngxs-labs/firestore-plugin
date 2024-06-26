import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherComponent } from './other.component';

describe('OtherComponent', () => {
  let component: OtherComponent;
  let fixture: ComponentFixture<OtherComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OtherComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {});

  it('should create', () => {
    fixture = TestBed.createComponent(OtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
