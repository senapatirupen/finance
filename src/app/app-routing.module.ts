import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceComponent } from './finance/finance.component';
import { FundamentalsComponent } from './fundamentals/fundamentals.component';
import { GoldInvestmentComponent } from './investment-psychology/gold-investment/gold-investment.component';
import { InvestmentPsychologyComponent } from './investment-psychology/investment-psychology.component';
import { RealEstateInvestmentComponent } from './investment-psychology/real-estate-investment/real-estate-investment.component';
import { ShareMarketInvestmentComponent } from './investment-psychology/share-market-investment/share-market-investment.component';
import { SpendingVsInvestingComponent } from './investment-psychology/spending-vs-investing/spending-vs-investing.component';
import { MutualFundComponent } from './mutual-fund/mutual-fund.component';
import { NseComponent } from './nse/nse.component';

const routes: Routes = [
  { path: '', component: FinanceComponent },
  { path: 'nse-bse', component: NseComponent },
  { path: 'fundamental', component: FundamentalsComponent },
  {
    path: 'psychology', component: InvestmentPsychologyComponent,
    children: [
      { path: 'gold-investment', component: GoldInvestmentComponent },
      { path: 'spending-vs-investmenting', component: SpendingVsInvestingComponent },
      { path: 'reale-state-investment', component: RealEstateInvestmentComponent },
      { path: 'share-market-investment', component: ShareMarketInvestmentComponent }



      // Add more child routes here if needed
    ]
  },
  { path: 'mutual-fund', component: MutualFundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
