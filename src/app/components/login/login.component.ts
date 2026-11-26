import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { focusWhenReady } from '../../shared/focus-when-ready';
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
  isGuestLoading = false;
  private readonly authService = inject(AuthService);

  /** Injects the router used for navigation after authentication. */
  constructor(private readonly router: Router) {}

  /** Starts the intro animation when the component initializes. */
  ngOnInit(): void {
    this.initIntroAnimation();
  }

  /** Skips the intro if it already played in this session, otherwise schedules its completion. */
  private initIntroAnimation(): void {
    const alreadyPlayed = sessionStorage.getItem('dabubble_intro_done') === 'true';
    if (alreadyPlayed) {
      this.introCompleted = true;
      focusWhenReady('email');
      return;
    }
    this.scheduleIntroCompletion();
  }

  /** Marks the intro as completed after a delay and remembers it in session storage. */
  private scheduleIntroCompletion(): void {
    setTimeout(() => {
      this.introCompleted = true;
      sessionStorage.setItem('dabubble_intro_done', 'true');
      focusWhenReady('email');
    }, 1800);
  }

  /** Checks whether the entered email address is valid. */
  isEmailValid(): boolean {
    return isValidEmail(this.email);
  }

  /** Checks that the password field is not empty. */
  isPasswordValid(): boolean {
    return this.password.trim().length > 0;
  }

  /** Returns true if the email field was touched and its value is invalid. */
  showEmailError(): boolean {
    return this.emailTouched && !this.isEmailValid();
  }

  /** Returns true if the password is invalid after being touched or an authentication error is present. */
  showPasswordError(): boolean {
    return (this.passwordTouched && !this.isPasswordValid()) || this.authError.length > 0;
  }

  /** Returns the mail icon path, highlighted while the field is focused or filled. */
  getMailIcon(): string {
    const isActive = this.emailFocused || this.email.trim().length > 0;
    return isActive ? 'assets/icons/mail-black.svg' : 'assets/icons/mail.svg';
  }

  /** Returns the lock icon path, highlighted while the field is focused or filled. */
  getLockIcon(): string {
    const isActive = this.passwordFocused || this.password.trim().length > 0;
    return isActive ? 'assets/icons/lock-black.svg' : 'assets/icons/lock.svg';
  }

  /** Marks the email field as focused. */
  onEmailFocus(): void {
    this.emailFocused = true;
  }

  /** Clears the email focus state and marks the field as touched if it has a value. */
  onEmailBlur(): void {
    this.emailFocused = false;
    if (this.email.length > 0) {
      this.emailTouched = true;
    }
  }

  /** Clears the authentication error when the email changes. */
  onEmailInput(): void {
    this.authError = '';
  }

  /** Marks the password field as focused. */
  onPasswordFocus(): void {
    this.passwordFocused = true;
  }

  /** Clears the password focus state and marks the field as touched if it has a value. */
  onPasswordBlur(): void {
    this.passwordFocused = false;
    if (this.password.length > 0) {
      this.passwordTouched = true;
    }
  }

  /** Clears the authentication error when the password changes. */
  onPasswordInput(): void {
    this.authError = '';
  }

  /** Validates the form and starts the login if all fields are valid. */
  onSubmit(): void {
    this.markAllFieldsTouched();
    if (!this.isEmailValid() || !this.isPasswordValid()) {
      return;
    }
    this.performLogin();
  }

  /** Marks both email and password fields as touched. */
  private markAllFieldsTouched(): void {
    this.emailTouched = true;
    this.passwordTouched = true;
  }

  /** Logs in with the entered email and password. */
  private performLogin(): Promise<void> {
    return this.runAuth(() => this.authService.login(this.email, this.password));
  }

  /** Signs in anonymously and shows a loading label on the guest button meanwhile. */
  async onGuestLogin(): Promise<void> {
    this.emailTouched = false;
    this.passwordTouched = false;
    this.isGuestLoading = true;
    await this.runAuth(() => this.authService.loginAsGuest());
    this.isGuestLoading = false;
  }

  /** Starts the login with a Google account. */
  onGoogleLogin(): void {
    this.runAuth(() => this.authService.loginWithGoogle());
  }

  /** Runs an authentication action once at a time, then navigates to the dashboard or sets the error message. */
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
