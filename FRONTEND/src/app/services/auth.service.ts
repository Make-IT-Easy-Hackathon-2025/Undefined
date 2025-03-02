import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

interface ApiResponse {
  token: any;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.MAIN_ENDPOINT_URL}`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private messageService: MessageService, private router: Router) {
    // Check if user is already authenticated
    this.checkAuthStatus();
  }

  register(email: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/signup`, {
      user: {
        email_address: email,
        password: password,
        password_confirmation: password
      }
    }).pipe(
      tap(response => {
        if (response.token) {
          sessionStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  sendOnboardingInfo(firstname: string, lastname: string, country: string, institution: string, educationlevel: string, usageplan: string): Observable<ApiResponse> {
    let token = sessionStorage.getItem('token');
    return this.http.put<ApiResponse>(`${this.apiUrl}/onboarding`, {
      user: {
        firstname,
        lastname,
        country,
        institution,
        educationlevel,
        usageplan
      }
    }, { headers: { "Authorization": token || '' }}).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  login(email: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/login`, {
      user: {
        email_address: email,
        password: password
      }
    }).pipe(
      tap(response => {
        if (response.token) {
          sessionStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): Observable<ApiResponse> {
    let token = sessionStorage.getItem('token');
    return this.http.delete<ApiResponse>(`${this.apiUrl}/logout`, { headers: { "Authorization": token || '' }
    }).pipe(
      tap(response => {
        sessionStorage.removeItem('token');
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    let token = sessionStorage.getItem('token');
    return this.http.get<{ loggedIn: boolean, user: User }>(
      `${this.apiUrl}/verify`, { headers: { "Authorization": token || '' } }
    ).pipe(
      map(response => {
        if (response.loggedIn && response.user) {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          return true;
        } else {
          this.isAuthenticatedSubject.next(false);
          return false;
        }
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        return of(false);
      })
    );
  }

  getUserInfo(): Observable<User> {
    let token = sessionStorage.getItem('token');
    return this.http.get<User>(`${this.apiUrl}/user-info`, { headers: { "Authorization": token || '' } });
  }

  getUniversities() {
    return [
      'Sapientia Hungarian University of Transylvania',
    ];
  }
}
