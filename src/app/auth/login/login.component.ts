import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent {
    email = ''; password = ''; error = ''; loading = false;
    constructor(private auth: AuthService, private router: Router) { }
    async submit() {
        this.error = '';
        try {
            this.loading = true;
            await this.auth.login(this.email, this.password);
            this.router.navigate(['/user']);
        } catch (e: any) { this.error = e.message || 'Login failed'; }
        finally { this.loading = false; }
    }
}