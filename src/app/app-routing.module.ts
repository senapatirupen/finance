import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceComponent } from './finance/finance.component';
import { FundamentalsComponent } from './fundamentals/fundamentals.component';
import { NseComponent } from './nse/nse.component';

const routes: Routes = [
  { path: '', component: FinanceComponent },
  { path: 'nse', component: NseComponent },
  { path: 'fundamental', component: FundamentalsComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
