import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EtfComponent } from './etf/etf.component';
import { FinanceComponent } from './finance/finance.component';
import { FundamentalsComponent } from './fundamentals/fundamentals.component';
import { GoldInvestmentComponent } from './investment-psychology/gold-investment/gold-investment.component';
import { InvestmentPsychologyComponent } from './investment-psychology/investment-psychology.component';
import { RealEstateInvestmentComponent } from './investment-psychology/real-estate-investment/real-estate-investment.component';
import { ShareMarketInvestmentComponent } from './investment-psychology/share-market-investment/share-market-investment.component';
import { SpendingVsInvestingComponent } from './investment-psychology/spending-vs-investing/spending-vs-investing.component';
import { MutualFundComponent } from './mutual-fund/mutual-fund.component';
import { MfScreenerComponent } from './mf-screener/mf-screener.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { SipCalculatorComponent } from './components/sip-list/sip-calculator.component';
import { LumpSumCalculatorComponent } from './components/lump-sum-list/lump-sum-calculator.component';
import { EmiCalculatorComponent } from './components/emi-list/emi-calculator.component';
import { IncomeCalculatorComponent } from './components/income-list/income-calculator.component';
import { GoalsCalculatorComponent } from './components/goal-list/goals-calculator.component';
import { InvestmentOptionsComponent } from './components/investment-list/investment-options.component';

const routes: Routes = [
  { path: '', redirectTo: 'finance', pathMatch: 'full' },
  { path: 'finance', component: FinanceComponent },
  { path: 'etf', component: EtfComponent },
  { path: 'fundamental', component: FundamentalsComponent },
  {
    path: 'psychology', component: InvestmentPsychologyComponent,
    children: [
      { path: 'gold-investment', component: GoldInvestmentComponent },
      { path: 'spending-vs-investment', component: SpendingVsInvestingComponent },
      { path: 'reale-state-investment', component: RealEstateInvestmentComponent },
      { path: 'share-market-investment', component: ShareMarketInvestmentComponent }
      // Add more child routes here if needed
    ]
  },
  { path: 'mutual-fund', component: MutualFundComponent },
  { path: 'mf-screener', component: MfScreenerComponent },
  {
    path: 'planning',
    component: PlanningComponent,
    children: [
      { path: 'dashboard', component: InvestmentOptionsComponent }, // Using ExpenseList as dashboard for demo
      { path: 'expenses', component: ExpenseListComponent },
      { path: 'expenses/new', component: ExpenseFormComponent },
      { path: 'expenses/edit/:id', component: ExpenseFormComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'sip', component: SipCalculatorComponent },
      { path: 'lump-sum', component: LumpSumCalculatorComponent },
      { path: 'emi', component: EmiCalculatorComponent },
      { path: 'income', component: IncomeCalculatorComponent },
      { path: 'goal', component: GoalsCalculatorComponent }




    ]
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
