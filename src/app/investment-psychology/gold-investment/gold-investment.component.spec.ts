import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldInvestmentComponent } from './gold-investment.component';

describe('GoldInvestmentComponent', () => {
  let component: GoldInvestmentComponent;
  let fixture: ComponentFixture<GoldInvestmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoldInvestmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoldInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
