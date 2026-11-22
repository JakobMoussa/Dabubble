import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isValidEmail } from '../../shared/validators/email.validator';
import { AuthService } from '../../services/auth.service';
import { toAuthMessage } from '../../shared/auth-error-messages';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  emailFocused = false;
  passwordFocused = false;
  emailTouched = false;
  passwordTouched = false;
  authError = '';
  introCompleted = false;

  isSubmitting = false;
  private readonly authService = inject(AuthService);

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.initIntroAnimation();
  }

  private initIntroAnimation(): void {
    const alreadyPlayed = sessionStorage.getItem('dabubble_intro_done') === 'true';
    if (alreadyPlayed) {
      this.introCompleted = true;
      return;
    }
    this.scheduleIntroCompletion();
  }

  private scheduleIntroCompletion(): void {
    setTimeout(() => {
      this.introCompleted = true;
      sessionStorage.setItem('dabubble_intro_done', 'true');
    }, 1800);
  }

  isEmailValid(): boolean {
    return isValidEmail(this.email);
  }

  isPasswordValid(): boolean {
    return this.password.trim().length > 0;
  }

  showEmailError(): boolean {
    return this.emailTouched && !this.isEmailValid();
  }

  showPasswordError(): boolean {
    return (this.passwordTouched && !this.isPasswordValid()) || this.authError.length > 0;
  }

  getMailIcon(): string {
    const isActive = this.emailFocused || this.email.trim().length > 0;
    return isActive ? 'assets/icons/mail-black.svg' : 'assets/icons/mail.svg';
  }

  getLockIcon(): string {
    const isActive = this.passwordFocused || this.password.trim().length > 0;
    return isActive ? 'assets/icons/lock-black.svg' : 'assets/icons/lock.svg';
  }

  onEmailFocus(): void {
    this.emailFocused = true;
  }

  onEmailBlur(): void {
    this.emailFocused = false;
    if (this.email.length > 0) {
      this.emailTouched = true;
    }
  }

  onEmailInput(): void {
    this.authError = '';
  }

  onPasswordFocus(): void {
    this.passwordFocused = true;
  }

  onPasswordBlur(): void {
    this.passwordFocused = false;
    if (this.password.length > 0) {
      this.passwordTouched = true;
    }
  }

  onPasswordInput(): void {
    this.authError = '';
  }

  onSubmit(): void {
    this.markAllFieldsTouched();
    if (!this.isEmailValid() || !this.isPasswordValid()) {
      return;
    }
    this.performLogin();
  }

  private markAllFieldsTouched(): void {
    this.emailTouched = true;
    this.passwordTouched = true;
  }

  private performLogin(): Promise<void> {
    return this.runAuth(() => this.authService.login(this.email, this.password));
  }

  onGuestLogin(): void {
    this.emailTouched = false;
    this.passwordTouched = false;
    this.runAuth(() => this.authService.loginAsGuest());
  }

  onGoogleLogin(): void {
    this.runAuth(() => this.authService.loginWithGoogle());
  }

  private async runAuth(action: () => Promise<void>): Promise<void> {
    if (this.isSubmitting) {
      return;
    }
    this.authError = '';
    this.isSubmitting = true;
    try {
      await action();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.authError = toAuthMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
