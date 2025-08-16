import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({ 
  selector: 'app-user-detail', 
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
 })
export class UserDetailComponent {
  constructor(public auth: AuthService) { }
}