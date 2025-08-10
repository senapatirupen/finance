import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { User } from '../model/user.model';

@Injectable({ providedIn: 'root' })
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
        if (created) {
            this.setSession(created);
        } else {
            throw new Error('User creation failed');
        }
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