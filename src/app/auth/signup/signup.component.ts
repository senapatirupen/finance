import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({selector: 'app-signup', templateUrl: './signup.component.html'})
export class SignupComponent {
  name=''; email=''; password=''; confirm=''; error=''; loading=false;
  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error='';
    if (!this.name || !this.email || !this.password) { this.error='All fields required'; return; }
    if (this.password !== this.confirm) { this.error='Passwords do not match'; return; }
    try {
      this.loading = true;
      const user = await this.auth.signUpPromise(this.name, this.email, this.password);
      this.router.navigate(['/user']);
    } catch (e:any) { this.error = e.message || 'Sign up failed'; }
    finally { this.loading=false; }
  }
}