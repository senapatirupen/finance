import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMarketInvestmentComponent } from './share-market-investment.component';

describe('ShareMarketInvestmentComponent', () => {
  let component: ShareMarketInvestmentComponent;
  let fixture: ComponentFixture<ShareMarketInvestmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareMarketInvestmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMarketInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
