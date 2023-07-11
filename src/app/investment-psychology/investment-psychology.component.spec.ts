import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentPsychologyComponent } from './investment-psychology.component';

describe('InvestmentPsychologyComponent', () => {
  let component: InvestmentPsychologyComponent;
  let fixture: ComponentFixture<InvestmentPsychologyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestmentPsychologyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentPsychologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
