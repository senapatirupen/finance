import { Component, EventEmitter } from '@angular/core';
import { interval, Observable, Subscriber, Subscription } from 'rxjs';
import { CalculationService } from './calculation.service';
import { map, merge } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
}
