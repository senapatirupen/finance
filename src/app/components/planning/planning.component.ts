import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent {
  activeTab: string = 'dashboard';

  constructor(private router: Router) {}

  isActive(routePath: string): boolean {
    return this.router.url.includes(routePath);
  }

  setActive(tab: string): void {
    this.activeTab = tab;
  }
}