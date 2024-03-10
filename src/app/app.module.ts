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
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


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
    MfScreenerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
