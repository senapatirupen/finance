import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({selector:'app-forgot', templateUrl:'./forgot.component.html'})
export class ForgotComponent{
  step=1; email=''; error=''; msg=''; newPass=''; confirm=''; userId: number|undefined;
  api='http://localhost:3000';
  constructor(private http: HttpClient, private auth: AuthService){}

  async findEmail(){
    this.error=''; this.msg='';
    const users: any = await this.http.get(`${this.api}/users?email=${encodeURIComponent(this.email)}`).toPromise();
    if (!users || !users.length) { this.error='Email not found'; return; }
    this.userId = users[0].id;
    this.step = 2;
  }

  async reset(){
    if (this.newPass !== this.confirm) { this.error='Passwords do not match'; return; }
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(this.newPass, salt);
    await this.http.patch(`${this.api}/users/${this.userId}`, { password: hashed }).toPromise();
    this.msg = 'Password reset. Please login.';
    this.step = 1; this.email=''; this.newPass=''; this.confirm='';
  }
}