import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingVsInvestingComponent } from './spending-vs-investing.component';

describe('SpendingVsInvestingComponent', () => {
  let component: SpendingVsInvestingComponent;
  let fixture: ComponentFixture<SpendingVsInvestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpendingVsInvestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpendingVsInvestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
