import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, AuthError } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { BehaviorSubject, from, Observable, of, firstValueFrom } from 'rxjs';
import { catchError, map, tap, switchMap, finalize } from 'rxjs/operators';
import { environment } from './environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isAuthenticating = new BehaviorSubject<boolean>(false);
  isAuthenticating$ = this.isAuthenticating.asObservable();

  private firebaseApp = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.firebaseApp);
  private tokenRefreshTimer: any;
  private router = inject(Router);
  constructor() {
    this.auth.onAuthStateChanged(user => {
      this.userSubject.next(user);
    });
  }

  loginWithGoogle(): Observable<string> {
    const provider = new GoogleAuthProvider();
    this.isAuthenticating.next(true);

    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(result => from(result.user.getIdToken())),
      finalize(() => this.isAuthenticating.next(false)),
      catchError(this.handleAuthError),
    );
  }

  signOut(): Observable<void> {
    return from(this.auth.signOut()).pipe(
      tap(() => {
        this.userSubject.next(null);
        localStorage.removeItem('auth_token');
        if (this.tokenRefreshTimer) {
          clearInterval(this.tokenRefreshTimer);
        }
        this.router.navigate(['/login']);
      }),
      catchError(this.handleAuthError),
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.getValue();
  }

  private handleAuthError = (error: AuthError): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Login popup was closed before completion';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Login request was cancelled';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Login popup was blocked by the browser';
        break;
      case 'auth/unauthorized-domain':
        errorMessage = 'Domain not authorized for Firebase authentication';
        break;
      default:
        errorMessage = error.message;
    }
    return new Observable(observer => observer.error(errorMessage));
  };
}
