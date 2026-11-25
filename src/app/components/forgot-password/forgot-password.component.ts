import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isValidEmail } from '../../shared/validators/email.validator';
import { AuthService } from '../../services/auth.service';
import { toAuthMessage } from '../../shared/auth-error-messages';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnDestroy {
  email = '';
  emailFocused = false;
  emailTouched = false;
  showToast = false;
  isSubmitting = false;

  submitError = '';

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly authService = inject(AuthService);

  /** Injects the router used for navigation after the reset mail was sent. */
  constructor(private readonly router: Router) {}


  /** Cancels a pending redirect timer when the component is destroyed. */
  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }


  /** Checks whether the entered email address is valid. */
  isEmailValid(): boolean {
    return isValidEmail(this.email);
  }


  /** Returns true if the email field was touched and its value is invalid. */
  showEmailError(): boolean {
    return this.emailTouched && !this.isEmailValid();
  }


  /** Returns the mail icon path, highlighted while the field is focused or filled. */
  getMailIcon(): string {
    const isActive = this.emailFocused || this.email.trim().length > 0;
    return isActive ? 'assets/icons/mail-black.svg' : 'assets/icons/mail.svg';
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


  /** Resets the touched state once the entered email becomes valid. */
  onEmailInput(): void {
    if (this.isEmailValid()) {
      this.emailTouched = false;
    }
  }


  /** Validates the email and sends the password reset mail. */
  onSubmit(): void {
    this.emailTouched = true;
    if (!this.isEmailValid() || this.isSubmitting) {
      return;
    }
    this.sendResetEmail();
  }


  /** Sends the password reset mail and shows the success toast, or sets an error message on failure. */
  private async sendResetEmail(): Promise<void> {
    this.isSubmitting = true;
    this.submitError = '';
    try {
      await this.authService.sendResetMail(this.email);
      this.showSuccessAndRedirect();
    } catch (error) {
      this.submitError = toAuthMessage(error);
      this.isSubmitting = false;
    }
  }


  /** Shows the success toast and redirects to the login page after a short delay. */
  private showSuccessAndRedirect(): void {
    this.showToast = true;
    this.redirectTimer = setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1800);
  }
}
