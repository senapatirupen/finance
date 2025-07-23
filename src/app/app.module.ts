import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FinanceComponent } from './finance/finance.component';
import { NseComponent } from './nse/nse.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { InvestmentTypeComponent } from './finance/investment-type/investment-type.component';
import { FundamentalsComponent } from './fundamentals/fundamentals.component';
import { HttpClientModule } from '@angular/common/http';
import { InvestmentPsychologyComponent } from './investment-psychology/investment-psychology.component';
import { MutualFundComponent } from './mutual-fund/mutual-fund.component';
import { GoldInvestmentComponent } from './investment-psychology/gold-investment/gold-investment.component';
import { RealEstateInvestmentComponent } from './investment-psychology/real-estate-investment/real-estate-investment.component';
import { ShareMarketInvestmentComponent } from './investment-psychology/share-market-investment/share-market-investment.component';
import { SpendingVsInvestingComponent } from './investment-psychology/spending-vs-investing/spending-vs-investing.component';
import { MfKeyTermsComponent } from './mutual-fund/mf-key-terms/mf-key-terms.component';
import { MfTypeComponent } from './mutual-fund/mf-type/mf-type.component';
import { EtfComponent } from './etf/etf.component';
import { MfScreenerComponent } from './mf-screener/mf-screener.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MutualFundService } from './services/mutual-fund.service';
import { PlanningComponent } from './components/planning/planning.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { DatePipe } from '@angular/common';
import { SipCalculatorComponent } from './components/sip-list/sip-calculator.component';
import { LumpSumCalculatorComponent } from './components/lump-sum-list/lump-sum-calculator.component';
import { EmiCalculatorComponent } from './components/emi-list/emi-calculator.component';
import { IncomeCalculatorComponent } from './components/income-list/income-calculator.component';
import { GoalsCalculatorComponent } from './components/goal-list/goals-calculator.component';
import { InvestmentOptionsComponent } from './components/investment-list/investment-options.component';
import { FutureProjectionComponent } from './components/future-projection/future-projection.component';


@NgModule({
  declarations: [
    AppComponent,
    FinanceComponent,
    NseComponent,
    HeaderComponent,
    FooterComponent,
    InvestmentTypeComponent,
    FundamentalsComponent,
    InvestmentPsychologyComponent,
    MutualFundComponent,
    GoldInvestmentComponent,
    RealEstateInvestmentComponent,
    ShareMarketInvestmentComponent,
    SpendingVsInvestingComponent,
    MfKeyTermsComponent,
    MfTypeComponent,
    EtfComponent,
    MfScreenerComponent,
    PlanningComponent,
    ExpenseListComponent,
    ExpenseFormComponent,
    FutureProjectionComponent,
    SipCalculatorComponent,
    LumpSumCalculatorComponent,
    EmiCalculatorComponent,
    IncomeCalculatorComponent,
    GoalsCalculatorComponent,
    InvestmentOptionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [MutualFundService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
