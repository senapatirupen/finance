import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentTypeComponent } from './investment-type.component';

describe('InvestmentTypeComponent', () => {
  let component: InvestmentTypeComponent;
  let fixture: ComponentFixture<InvestmentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestmentTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
