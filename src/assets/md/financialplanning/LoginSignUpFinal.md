# Angular-Auth-Expenses (Bootstrap + json-server)

Small Angular app with: Sign Up, Login, Forget Password, User Detail, Monthly Expenses (protected), and a few public Investment Psychology components. Uses Bootstrap for UI and `json-server` as a simple backend. Passwords are hashed with `bcryptjs` on the client before saving to json-server (for demo only). **Important:** hashing on client-side is only for demonstration — production must hash & authenticate on the server.

---

## Features

- Sign up (checks whether email already exists)
- Login (bcryptjs password compare)
- Forgot password (very basic flow: reset by entering new password after email match)
- User detail page (requires login)
- Monthly expenses component (requires login)
- Investment Psychology components (public — no login required)
- Uses Bootstrap for responsive UI
- Stores data in `db.json` for `json-server`

---

## Quick setup

1. Install Angular CLI (if you don't have it):

```bash
npm i -g @angular/cli
```

2. Create project (or copy files below into an Angular project):

```bash
ng new auth-expenses --routing --style=css
cd auth-expenses
```

3. Install dependencies:

```bash
npm install bootstrap bcryptjs json-server
```

Add bootstrap to `angular.json` "styles":

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
]
```

4. Create `db.json` in project root (see below).

5. Run json-server:

```bash
npx json-server --watch db.json --port 3000
```

6. Run Angular app:

```bash
ng serve
```

Access app at `http://localhost:4200` and json-server at `http://localhost:3000`.

---

## `db.json` (starter)

```json
{
  "users": [],
  "expenses": []
}
```

---

## package.json (important deps)

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "bootstrap": "^5.3.0",
    "json-server": "^0.17.0"
  }
}
```

---

## App architecture / important files (copy into `src/app`)

### models/user.ts

```ts
export interface User {
  id?: number;
  name: string;
  email: string;
  password: string; // hashed
}
```

---

### services/auth.service.ts

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { User } from '../models/user';

@Injectable({providedIn: 'root'})
export class AuthService {
  api = 'http://localhost:3000';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('currentUser');
    if (raw) this.userSubject.next(JSON.parse(raw));
  }

  signUp(name: string, email: string, password: string) {
    // check if exists
    return this.http.get<User[]>(`${this.api}/users?email=${encodeURIComponent(email)}`)
      .pipe(map(users => {
        if (users.length) throw new Error('Email already exists');
        const salt = bcrypt.genSaltSync(10);
        const hashed = bcrypt.hashSync(password, salt);
        const user: User = { name, email, password: hashed };
        // save
        return this.http.post<User>(`${this.api}/users`, user).toPromise();
      }),
      // flatten promise for callers
      map(p => p)
    );
  }

  async signUpPromise(name: string, email: string, password: string) {
    const users = await this.http.get<User[]>(`${this.api}/users?email=${encodeURIComponent(email)}`).toPromise();
    if (users && users.length) throw new Error('Email already exists');
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(password, salt);
    const user: User = { name, email, password: hashed };
    const created = await this.http.post<User>(`${this.api}/users`, user).toPromise();
    this.setSession(created);
    return created;
  }

  async login(email: string, password: string) {
    const users = await this.http.get<User[]>(`${this.api}/users?email=${encodeURIComponent(email)}`).toPromise();
    if (!users || !users.length) throw new Error('Invalid email or password');
    const user = users[0];
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) throw new Error('Invalid email or password');
    this.setSession(user);
    return user;
  }

  private setSession(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }
}
```

> Note: I provided both an Observable-based `signUp()` and an `async signUpPromise()` — use the promise version in components for simpler flow.

---

### guards/auth.guard.ts

```ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.currentUser) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
```

---

### app-routing.module.ts

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { MonthlyExpensesComponent } from './monthly-expenses/monthly-expenses.component';
import { InvestmentOneComponent } from './investments/invest1.component';
import { InvestmentTwoComponent } from './investments/invest2.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: InvestmentOneComponent },
  { path: 'invest2', component: InvestmentTwoComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot', component: ForgotComponent },
  { path: 'user', component: UserDetailComponent, canActivate: [AuthGuard] },
  { path: 'expenses', component: MonthlyExpensesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

### signup.component.ts

```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
```

### signup.component.html

```html
<div class="container mt-4">
  <h3>Sign Up</h3>
  <div *ngIf="error" class="alert alert-danger">{{error}}</div>
  <form (submit)="$event.preventDefault(); submit()">
    <div class="mb-3"><input [(ngModel)]="name" name="name" class="form-control" placeholder="Full name" required></div>
    <div class="mb-3"><input [(ngModel)]="email" name="email" class="form-control" placeholder="Email" required type="email"></div>
    <div class="mb-3"><input [(ngModel)]="password" name="password" class="form-control" placeholder="Password" type="password" required></div>
    <div class="mb-3"><input [(ngModel)]="confirm" name="confirm" class="form-control" placeholder="Confirm Password" type="password" required></div>
    <button class="btn btn-primary" [disabled]="loading">Sign Up</button>
  </form>
</div>
```

---

### login.component.ts

```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({selector:'app-login', templateUrl:'./login.component.html'})
export class LoginComponent{
  email=''; password=''; error=''; loading=false;
  constructor(private auth: AuthService, private router: Router){}
  async submit(){
    this.error='';
    try{
      this.loading=true;
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/user']);
    }catch(e:any){ this.error = e.message || 'Login failed'; }
    finally{ this.loading=false; }
  }
}
```

### login.component.html

```html
<div class="container mt-4">
  <h3>Login</h3>
  <div *ngIf="error" class="alert alert-danger">{{error}}</div>
  <form (submit)="$event.preventDefault(); submit()">
    <div class="mb-3"><input [(ngModel)]="email" name="email" class="form-control" placeholder="Email" type="email" required></div>
    <div class="mb-3"><input [(ngModel)]="password" name="password" class="form-control" placeholder="Password" type="password" required></div>
    <button class="btn btn-primary" [disabled]="loading">Login</button>
    <a class="btn btn-link" routerLink="/forgot">Forgot?</a>
  </form>
</div>
```

---

### forgot.component.ts + forgot.component.html

Simple flow: user enters email, if found we allow reset by entering new password.

```ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';

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
```

`forgot.component.html`:

```html
<div class="container mt-4">
  <h3>Forgot Password</h3>
  <div *ngIf="error" class="alert alert-danger">{{error}}</div>
  <div *ngIf="msg" class="alert alert-success">{{msg}}</div>

  <div *ngIf="step===1">
    <form (submit)="$event.preventDefault(); findEmail()">
      <div class="mb-3"><input [(ngModel)]="email" name="email" class="form-control" placeholder="Enter your email"></div>
      <button class="btn btn-primary">Find</button>
    </form>
  </div>

  <div *ngIf="step===2">
    <form (submit)="$event.preventDefault(); reset()">
      <div class="mb-3"><input [(ngModel)]="newPass" name="newPass" class="form-control" placeholder="New password" type="password"></div>
      <div class="mb-3"><input [(ngModel)]="confirm" name="confirm" class="form-control" placeholder="Confirm password" type="password"></div>
      <button class="btn btn-primary">Reset</button>
    </form>
  </div>
</div>
```

---

### user-detail.component.ts + html

```ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({selector:'app-user-detail', templateUrl:'./user-detail.component.html'})
export class UserDetailComponent{
  constructor(public auth: AuthService){}
}
```

```html
<div class="container mt-4">
  <h3>User Detail</h3>
  <div *ngIf="auth.currentUser; else noUser">
    <p><strong>Name:</strong> {{auth.currentUser.name}}</p>
    <p><strong>Email:</strong> {{auth.currentUser.email}}</p>
    <button class="btn btn-danger" (click)="auth.logout()">Logout</button>
  </div>
  <ng-template #noUser>
    <p>You are not logged in.</p>
  </ng-template>
</div>
```

---

### monthly-expenses.component.ts + html

```ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({selector:'app-monthly-expenses', templateUrl:'./monthly-expenses.component.html'})
export class MonthlyExpensesComponent implements OnInit{
  expenses:any[]=[]; api='http://localhost:3000';
  constructor(private http: HttpClient){}
  ngOnInit(){ this.load(); }
  async load(){ this.expenses = await this.http.get(`${this.api}/expenses`).toPromise() as any[]; }
}
```

```html
<div class="container mt-4">
  <h3>Monthly Expenses (Protected)</h3>
  <table class="table table-striped">
    <thead><tr><th>Month</th><th>Category</th><th>Amount</th></tr></thead>
    <tbody>
      <tr *ngFor="let e of expenses"><td>{{e.month}}</td><td>{{e.category}}</td><td>{{e.amount}}</td></tr>
    </tbody>
  </table>
</div>
```

---

### investments components (public)

Create two minimal components `invest1` and `invest2` to show public content. No guard.

---

### app.component.html (navigation)

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" routerLink="/">InvestApp</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav me-auto">
        <li class="nav-item"><a class="nav-link" routerLink="/">Invest1</a></li>
        <li class="nav-item"><a class="nav-link" routerLink="/invest2">Invest2</a></li>
        <li class="nav-item"><a class="nav-link" routerLink="/expenses">Monthly Expenses</a></li>
      </ul>
      <ul class="navbar-nav ms-auto">
        <li class="nav-item" *ngIf="!auth.currentUser"><a class="nav-link" routerLink="/login">Login</a></li>
        <li class="nav-item" *ngIf="!auth.currentUser"><a class="nav-link" routerLink="/signup">Sign Up</a></li>
        <li class="nav-item" *ngIf="auth.currentUser"><a class="nav-link" routerLink="/user">{{auth.currentUser.name}}</a></li>
      </ul>
    </div>
  </div>
</nav>
<router-outlet></router-outlet>
```

`app.component.ts` should inject `public auth: AuthService` in constructor so template can access it.

---

## Notes, security & improvements

- **Security:** This demo uses client-side hashing — unacceptable for production. A real backend should handle password hashing (bcrypt/scrypt/argon2), authentication tokens (JWT or session cookies), and password reset flows that email a secure token.
- **Email check:** We query `GET /users?email=...` to test uniqueness before POST. There is a tiny race condition if two users sign up at same time; server-side unique constraint is recommended.
- **JSON-server:** It's only for prototyping. To simulate login endpoints, consider `json-server-auth` or a small Express server.
- **Form validation:** Add Angular Reactive Forms for better validation and UX.
- **Better state:** Use an Observable-backed store for user and token handling.

---

If you'd like, I can:
- provide a downloadable ZIP of all files,
- generate a full repo structure with every file filled out,
- convert hashing/auth to a small Express backend so auth moves server-side,
- or create the full Angular project (I can produce the rest of files).

Tell me which you'd like next.

## Other Source

# Angular App with Auth & JSON-Server

I'll create a complete Angular application with authentication (signup, login, password reset), protected routes, and public investment components using Bootstrap and JSON-server.

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── auth.service.ts
│   ├── investments/ (public)
│   ├── expenses/ (protected)
│   ├── user-profile/
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── shared/
│   │   └── navbar/
│   └── app-routing.module.ts
├── assets/
│   └── db.json
```

## Implementation Steps

### 1. Set Up Angular Project

```bash
ng new finance-app
cd finance-app
ng add @ng-bootstrap/ng-bootstrap
npm install json-server bcryptjs
```

### 2. Create JSON-server Database (`assets/db.json`)

```json
{
  "users": [],
  "investments": [
    {"id": 1, "name": "Stocks", "description": "Stock market investments"},
    {"id": 2, "name": "Bonds", "description": "Government bonds"}
  ],
  "expenses": [
    {"id": 1, "userId": 1, "month": "January", "amount": 1500}
  ]
}
```

Start JSON-server (add to package.json scripts):
```json
"scripts": {
  "server": "json-server --watch src/assets/db.json --port 3000"
}
```

### 3. Auth Service (`auth.service.ts`)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  signup(user: any) {
    return this.http.get<any[]>(`${this.apiUrl}/users?email=${user.email}`).pipe(
      map(users => {
        if (users.length > 0) {
          throw new Error('Email already exists');
        }
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        return this.http.post(`${this.apiUrl}/users`, {
          ...user,
          password: hashedPassword
        });
      })
    );
  }

  login(email: string, password: string) {
    return this.http.get<any[]>(`${this.apiUrl}/users?email=${email}`).pipe(
      map(users => {
        const user = users[0];
        if (user && bcrypt.compareSync(password, user.password)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }
        throw new Error('Invalid credentials');
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  forgotPassword(email: string) {
    return this.http.get<any[]>(`${this.apiUrl}/users?email=${email}`).pipe(
      map(users => {
        if (users.length === 0) {
          throw new Error('Email not found');
        }
        // In real app, send password reset email
        return { message: 'Reset link sent to your email' };
      })
    );
  }
}
```

### 4. Auth Guard (`auth.guard.ts`)

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.currentUserValue) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### 5. Routing (`app-routing.module.ts`)

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./auth/login/login.module').then(m => m.LoginModule) },
  { path: 'signup', loadChildren: () => import('./auth/signup/signup.module').then(m => m.SignupModule) },
  { path: 'forgot-password', loadChildren: () => import('./auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule) },
  { path: 'investments', loadChildren: () => import('./investments/investments.module').then(m => m.InvestmentsModule) },
  { path: 'expenses', loadChildren: () => import('./expenses/expenses.module').then(m => m.ExpensesModule), canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: () => import('./user-profile/user-profile.module').then(m => m.UserProfileModule), canActivate: [AuthGuard] },
  { path: '', redirectTo: '/investments', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 6. Signup Component Example

```typescript
// signup.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = { name: '', email: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.signup(this.user).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      error => {
        this.errorMessage = error.message;
      }
    );
  }
}
```

```html
<!-- signup.component.html -->
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header">
          <h3>Sign Up</h3>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="form-control" [(ngModel)]="user.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" [(ngModel)]="user.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" [(ngModel)]="user.password" name="password" required>
            </div>
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
            <button type="submit" class="btn btn-primary">Sign Up</button>
          </form>
          <div class="mt-3">
            Already have an account? <a routerLink="/login">Login</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 7. Navbar Component

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container">
    <a class="navbar-brand" routerLink="/">Finance App</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link" routerLink="/investments">Investments</a>
        </li>
        <li class="nav-item" *ngIf="authService.currentUserValue">
          <a class="nav-link" routerLink="/expenses">Expenses</a>
        </li>
      </ul>
      <ul class="navbar-nav" *ngIf="!authService.currentUserValue">
        <li class="nav-item">
          <a class="nav-link" routerLink="/login">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/signup">Sign Up</a>
        </li>
      </ul>
      <ul class="navbar-nav" *ngIf="authService.currentUserValue">
        <li class="nav-item">
          <a class="nav-link" routerLink="/profile">Profile</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" (click)="logout()" style="cursor: pointer;">Logout</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

## Running the Application

1. Start JSON-server:
```bash
npm run server
```

2. Start Angular app:
```bash
ng serve
```

Now you have a complete Angular application with:
- Public investment pages (no login required)
- Protected expense pages (requires login)
- Full authentication flow (signup, login, password reset)
- Email existence check during signup
- Password encryption
- Bootstrap styling
- JSON-server backend

Would you like me to add any specific features or explain any part in more detail?

Great! Let's integrate your existing header component with the authentication system I described. Here's how to modify your header component to work with the auth flow:

## Updated Header Component (`header.component.ts`)

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

## Header Template (`header.component.html`)

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container-fluid">
    <a class="navbar-brand" routerLink="/">Finance App</a>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <!-- Public Routes -->
        <li class="nav-item">
          <a class="nav-link" routerLink="/investments">Investments</a>
        </li>
        
        <!-- Protected Routes (shown only when logged in) -->
        <li class="nav-item" *ngIf="authService.currentUserValue">
          <a class="nav-link" routerLink="/expenses">Monthly Expenses</a>
        </li>
        <li class="nav-item" *ngIf="authService.currentUserValue">
          <a class="nav-link" routerLink="/profile">User Profile</a>
        </li>
      </ul>

      <!-- Auth Links -->
      <ul class="navbar-nav" *ngIf="!authService.currentUserValue">
        <li class="nav-item">
          <a class="nav-link" routerLink="/login">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/signup">Sign Up</a>
        </li>
      </ul>

      <!-- User Info (shown when logged in) -->
      <ul class="navbar-nav" *ngIf="authService.currentUserValue">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
            {{ authService.currentUserValue.name || 'User' }}
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" routerLink="/profile">Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" (click)="logout()" style="cursor: pointer;">Logout</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

## Header Styles (`header.component.css`)

```css
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dropdown-menu {
  min-width: 8rem;
}

.nav-link {
  padding: 0.5rem 1rem;
}

.navbar-brand {
  font-weight: 600;
}
```

## Key Features of This Implementation:

1. **Dynamic Menu Items**:
   - Public routes (like Investments) always visible
   - Protected routes (Expenses, Profile) only show when logged in
   - Auth links (Login/Signup) only show when logged out

2. **User Dropdown**:
   - Shows user name when logged in
   - Contains profile link and logout option

3. **Responsive Design**:
   - Bootstrap navbar with collapse functionality
   - Works on mobile and desktop

4. **Integration with AuthService**:
   - Uses `currentUserValue` to check login status
   - Calls `logout()` method when logging out

5. **Visual Cues**:
   - Active routes are highlighted (Bootstrap handles this automatically)
   - Clean, modern design with subtle shadow

## How to Use It:

1. Make sure you have the `AuthService` properly set up (as in previous examples)
2. Place the header component in your `app.component.html`:
   ```html
   <app-header></app-header>
   <div class="container mt-4">
     <router-outlet></router-outlet>
   </div>
   ```
3. The header will automatically:
   - Update when user logs in/out
   - Show/hide protected routes
   - Display user information when logged in

Would you like me to add any specific features to the header or modify any part of this implementation?

Got it — we’ll modify the **MonthlyExpensesComponent** and the JSON Server API calls so expenses are filtered by the **logged-in user’s ID**, ensuring each user sees only their own entries.

Here’s how to adjust the code:

---

### 1. Add `userId` when saving expenses

When a user adds a new expense, attach the current user’s ID from `AuthService` before saving:

```ts
// Example: add-expense.component.ts
async addExpense() {
  if (!this.auth.currentUser) return;
  const expense = {
    month: this.month,
    category: this.category,
    amount: this.amount,
    userId: this.auth.currentUser.id
  };
  await this.http.post(`${this.api}/expenses`, expense).toPromise();
  this.load();
}
```

---

### 2. Filter expenses by current user in MonthlyExpensesComponent

Instead of loading all expenses, filter by `userId` in the GET request:

```ts
// monthly-expenses.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-monthly-expenses',
  templateUrl: './monthly-expenses.component.html'
})
export class MonthlyExpensesComponent implements OnInit {
  expenses: any[] = [];
  api = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.id;
    this.expenses = await this.http
      .get<any[]>(`${this.api}/expenses?userId=${uid}`)
      .toPromise() as any[];
  }
}
```

---

### 3. Ensure userId is stored in JSON Server

Your `db.json` will now have expenses like:

```json
{
  "expenses": [
    { "id": 1, "month": "July", "category": "Food", "amount": 5000, "userId": 2 },
    { "id": 2, "month": "July", "category": "Rent", "amount": 15000, "userId": 1 }
  ]
}
```

If `userId` = 2 is logged in, they will only see the **Food** expense in the above example.

---

### 4. Protect against null auth state

Because MonthlyExpensesComponent is guarded by `AuthGuard`, normally `auth.currentUser` will exist.
But still check it to avoid errors.

---

If you want, I can now **add an "Add Expense" form** so each logged-in user can add and view **only their own** expenses, and it will work with json-server. That way your expenses page becomes fully functional with CRUD for a single user.

Do you want me to extend it that way?

Yes — here’s a clean **TypeScript model** for your expense entity that supports per-user expense tracking:

---

### `models/expense.ts`

```ts
export interface Expense {
  id?: number;       // auto-generated by json-server
  month: string;     // e.g., "July 2025"
  category: string;  // e.g., "Food", "Rent"
  amount: number;    // expense amount in Rs
  userId: number;    // id of the user who owns this expense
}
```

---

### Usage Example

When saving a new expense:

```ts
import { Expense } from '../models/expense';

// ...

const newExpense: Expense = {
  month: 'August 2025',
  category: 'Groceries',
  amount: 4500,
  userId: this.auth.currentUser!.id!
};

this.http.post<Expense>(`${this.api}/expenses`, newExpense).subscribe();
```

When fetching expenses for the logged-in user:

```ts
this.http
  .get<Expense[]>(`${this.api}/expenses?userId=${this.auth.currentUser!.id}`)
  .subscribe(data => this.expenses = data);
```

---

If you like, I can **also update your MonthlyExpensesComponent** to use this `Expense` model everywhere so you have strong typing instead of `any[]`. That will make it safer and easier to maintain.
