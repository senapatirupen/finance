import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.min.js';
import { MdName } from '../model/md-name';

@Component({
  selector: 'app-fundamentals',
  templateUrl: './fundamentals.component.html',
  styleUrls: ['./fundamentals.component.scss']
})
export class FundamentalsComponent implements OnInit {

  rightContent: string = '';
  contentTitle: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('assets/md/Stock Market.md', { responseType: 'text' }).subscribe((content: string) => {
      this.rightContent = content;
      this.contentTitle = 'Stock Market';
    });
  }

  loadRightContent(event: MouseEvent) {
    const anchorTag = event.target as HTMLAnchorElement;
    const value = anchorTag.textContent;
    console.log(value);
    if (value === MdName.PUBLIC_COMPANY) {
      this.http.get('assets/md/' + MdName.PUBLIC_COMPANY + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.PUBLIC_COMPANY;
      });
    }
    if (value === MdName.SHARE) {
      this.http.get('assets/md/' + MdName.SHARE + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.SHARE;

      });
    }
    if (value === MdName.STOCK) {
      this.http.get('assets/md/' + MdName.STOCK + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.STOCK;

      });
    }
    if (value === MdName.NSE) {
      this.http.get('assets/md/' + MdName.NSE + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.NSE;

      });
    } if (value === MdName.BSE) {
      this.http.get('assets/md/' + MdName.BSE + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.BSE;

      });
    } if (value === MdName.INDEXES) {
      this.http.get('assets/md/' + MdName.INDEXES + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.INDEXES;

      });
    } if (value === MdName.INDEXES_FORMATION) {
      this.http.get('assets/md/' + MdName.INDEXES_FORMATION + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.INDEXES_FORMATION;

      });
    } if (value === MdName.BROKER) {
      this.http.get('assets/md/' + MdName.BROKER + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.BROKER;

      });
    } if (value === MdName.BROKERS_IN_INDIA) {
      this.http.get('assets/md/' + MdName.BROKERS_IN_INDIA + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.BROKERS_IN_INDIA;

      });
    } if (value === MdName.BROKERAGE_CHARGES) {
      this.http.get('assets/md/' + MdName.BROKERAGE_CHARGES + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.BROKERAGE_CHARGES;

      });
    } if (value === MdName.MUTUAL_FUND) {
      this.http.get('assets/md/' + MdName.MUTUAL_FUND + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.MUTUAL_FUND;

      });
    }
    if (value === MdName.MUTUAL_FUND_TYPES) {
      this.http.get('assets/md/' + MdName.MUTUAL_FUND_TYPES + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.MUTUAL_FUND_TYPES;

      });
    }
    if (value === MdName.INDEX_MUTUAL_FUND) {
      this.http.get('assets/md/' + MdName.INDEX_MUTUAL_FUND + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.INDEX_MUTUAL_FUND;

      });
    } if (value === MdName.MUTUAL_FUND_PROVIDER) {
      this.http.get('assets/md/' + MdName.MUTUAL_FUND_PROVIDER + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.MUTUAL_FUND_PROVIDER;

      });
    } if (value === MdName.MUTUAL_FUND_CHARGES) {
      this.http.get('assets/md/' + MdName.MUTUAL_FUND_CHARGES + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
      });
    } if (value === MdName.TAX_ON_STOCK) {
      this.http.get('assets/md/' + MdName.TAX_ON_STOCK + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.TAX_ON_STOCK;

      });
    } if (value === MdName.TAX_ON_MUTUAL_FUND) {
      this.http.get('assets/md/' + MdName.TAX_ON_MUTUAL_FUND + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.TAX_ON_MUTUAL_FUND;

      });
    } if (value === MdName.SEBI) {
      this.http.get('assets/md/' + MdName.SEBI + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.SEBI;

      });
    } if (value === MdName.NSDL) {
      this.http.get('assets/md/' + MdName.NSDL + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.NSDL;

      });
    } if (value === MdName.CDSL) {
      this.http.get('assets/md/' + MdName.CDSL + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.CDSL;

      });
    }if (value === MdName.TYPES_OF_INVESTMENT) {
      this.http.get('assets/md/' + MdName.TYPES_OF_INVESTMENT + '.md', { responseType: 'text' }).subscribe((content: string) => {
        this.rightContent = content;
        this.contentTitle = MdName.TYPES_OF_INVESTMENT;

      });
    }
  }

}
