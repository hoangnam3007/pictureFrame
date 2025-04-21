import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators'; // ✅ Import switchMap

import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';
import { Login } from './login.model';
import { AuthService } from './auth.service'; // ✅ Correct class name

@Injectable({ providedIn: 'root' })
export class LoginService {
  private accountService = inject(AccountService);
  private authServerProvider = inject(AuthServerProvider);
  private authService = inject(AuthService); // ✅ Fix inject target

  login(credentials: Login): Observable<Account | null> {
    return this.authServerProvider.login(credentials).pipe(mergeMap(() => this.accountService.identity(true)));
  }

  loginWithGoogle(): Observable<Account | null> {
    return this.authService.loginWithGoogle().pipe(
      switchMap((idToken: string) => this.authServerProvider.loginWithGoogle(idToken, true)),
      switchMap(() => this.accountService.identity(true)),
    );
  }

  logout(): void {
    this.authServerProvider.logout().subscribe({
      complete: () => this.accountService.authenticate(null),
    });
  }
}
