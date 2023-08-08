import { Component, OnInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.min.js';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {
  externalLink: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  openLinkInNewTab(externalLink: string) {
    this.externalLink = externalLink;
    window.open(this.externalLink, '_blank');
  }

}
