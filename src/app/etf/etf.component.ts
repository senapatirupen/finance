import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-etf',
  templateUrl: './etf.component.html',
  styleUrls: ['./etf.component.scss']
})
export class EtfComponent implements OnInit {

  externalLink: string = ''


  constructor() { }

  ngOnInit(): void {
  }

  openLinkInNewTab(externalLink: string) {
    this.externalLink = externalLink;
    window.open(this.externalLink, '_blank');
  }

}
