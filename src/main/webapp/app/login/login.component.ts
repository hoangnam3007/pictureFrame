import { AfterViewInit, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';
import { AuthService } from './auth.service';
@Component({
  standalone: true,
  selector: 'jhi-login',
  imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export default class LoginComponent implements OnInit, AfterViewInit {
  username = viewChild.required<ElementRef>('username');
  authenticationError = signal(false);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  private accountService = inject(AccountService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.router.navigate(['']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.username().nativeElement.focus();
  }

  login(): void {
    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.authenticationError.set(false);
        if (!this.router.getCurrentNavigation()) {
          this.router.navigate(['']);
        }
      },
      error: () => this.authenticationError.set(true),
    });
  }

  loginWithGoogle(): void {
    this.loginService.loginWithGoogle().subscribe({
      next: () => {
        this.authenticationError.set(false);
        if (!this.router.getCurrentNavigation()) {
          this.router.navigate(['']);
        }
      },
      error: () => {
        this.authenticationError.set(true);
      },
    });
  }
}
