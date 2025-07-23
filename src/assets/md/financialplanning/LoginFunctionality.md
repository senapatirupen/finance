Here's a complete implementation for adding **signup, login, and logout** functionality to your Angular app with JSON Server:

---

### 1. First, update your `db.json` for user data:
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "password": "password123", // In production, store hashed passwords
      "name": "Test User"
    }
  ]
}
```

---

### 2. Create an Auth Service (`auth.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string; // For JWT (optional)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string, name: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, { email, password, name });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/users?email=${email}&password=${password}`)
      .pipe(
        tap(response => {
          if (response && response.length > 0) {
            this.currentUserSubject.next(response[0]);
            localStorage.setItem('currentUser', JSON.stringify(response[0]));
          }
        })
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  autoLogin(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }
}
```

---

### 3. Create Auth Guard (`auth.guard.ts`):
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.currentUser$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}
```

---

### 4. Create Login Component (`login.component.ts`):
```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.errorMessage = 'Invalid credentials'
      });
    }
  }
}
```

---

### 5. Login Template (`login.component.html`):
```html
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header">
          <h3>Login</h3>
        </div>
        <div class="card-body">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" formControlName="email">
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                   class="text-danger">
                Valid email is required
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" formControlName="password">
            </div>
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid">
              Login
            </button>
            <a routerLink="/signup" class="btn btn-link">Create account</a>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### 6. Signup Component (`signup.component.ts`):
```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { name, email, password } = this.signupForm.value;
      this.auth.signup(email, password, name).subscribe({
        next: () => {
          this.auth.login(email, password).subscribe(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (err) => console.error('Signup failed', err)
      });
    }
  }
}
```

---

### 7. Update App Routing (`app-routing.module.ts`):
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard] 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

### 8. Add Navigation Menu (`navbar.component.html`):
```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="#">My App</a>
    <div *ngIf="auth.currentUser$ | async as user">
      <span class="navbar-text me-3">Hello, {{ user.name }}</span>
      <button (click)="auth.logout()" class="btn btn-outline-light">Logout</button>
    </div>
  </div>
</nav>
```

---

### 9. Initialize Auth in App Component (`app.component.ts`):
```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.auth.autoLogin();
  }
}
```

---

### 10. Run JSON Server:
```bash
json-server --watch db.json --port 3000
```

---

### Key Features:
1. **JWT-ready architecture** (add token handling when needed)
2. **Form validation** for login/signup
3. **Route protection** with AuthGuard
4. **Persistent login** using localStorage
5. **Reactive UI** with BehaviorSubject
6. **Bootstrap styling** for all components

To implement:
1. Add password hashing (use bcrypt.js in a real app)
2. Add proper error handling
3. Implement JWT tokens if needed
4. Add password reset functionality

Would you like me to enhance any specific part of this implementation?