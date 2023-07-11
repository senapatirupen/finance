import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateInvestmentComponent } from './real-estate-investment.component';

describe('RealEstateInvestmentComponent', () => {
  let component: RealEstateInvestmentComponent;
  let fixture: ComponentFixture<RealEstateInvestmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealEstateInvestmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RealEstateInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
