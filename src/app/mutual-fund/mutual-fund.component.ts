import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

// https://api.mfapi.in/mf
// https://api.mfapi.in/mf/151369



@Component({
  selector: 'app-mutual-fund',
  templateUrl: './mutual-fund.component.html',
  styleUrls: ['./mutual-fund.component.scss']
})
export class MutualFundComponent implements OnInit {

  externalLink: string = ''

  constructor(public http: HttpClient) { }

  ngOnInit(): void {
  }

  openLinkInNewTab(externalLink: string) {
    this.externalLink = externalLink;
    window.open(this.externalLink, '_blank');
  }

}
