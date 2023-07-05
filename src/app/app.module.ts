import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FinanceComponent } from './finance/finance.component';
import { NseComponent } from './nse/nse.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { InvestmentTypeComponent } from './finance/investment-type/investment-type.component';
import { FundamentalsComponent } from './fundamentals/fundamentals.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    FinanceComponent,
    NseComponent,
    HeaderComponent,
    FooterComponent,
    InvestmentTypeComponent,
    FundamentalsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
