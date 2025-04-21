import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Login } from 'app/login/login.model';
import { ApplicationConfigService } from '../config/application-config.service';
import { StateStorageService } from './state-storage.service';
import { AuthService } from 'app/login/auth.service';

type JwtToken = {
  id_token: string;
};

interface LoginToken {
  idToken: string;
  rememberMe: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthServerProvider {
  private http = inject(HttpClient);
  private stateStorageService = inject(StateStorageService);
  private applicationConfigService = inject(ApplicationConfigService);
  private authService = inject(AuthService);
  getToken(): string {
    return this.stateStorageService.getAuthenticationToken() ?? '';
  }

  login(credentials: Login): Observable<void> {
    return this.http
      .post<JwtToken>(this.applicationConfigService.getEndpointFor('api/authenticate'), credentials)
      .pipe(map(response => this.authenticateSuccess(response, credentials.rememberMe)));
  }

  logout(): Observable<void> {
    return new Observable(observer => {
      this.stateStorageService.clearAuthenticationToken();
      observer.complete();
    });
  }

  loginWithGoogle(idToken: string, rememberMe: boolean): Observable<void> {
    const credentials: LoginToken = {
      idToken,
      rememberMe,
    };

    return this.http
      .post<JwtToken>(this.applicationConfigService.getEndpointFor('api/authenticate/google'), credentials)
      .pipe(map(response => this.authenticateSuccess(response, rememberMe)));
  }

  private authenticateSuccess(response: JwtToken, rememberMe: boolean): void {
    this.stateStorageService.storeAuthenticationToken(response.id_token, rememberMe);
  }
}
