import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { toAuthMessage } from '../../shared/auth-error-messages';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnDestroy {
  password = '';
  confirmPassword = '';
  passwordFocused = false;
  confirmFocused = false;
  passwordTouched = false;
  confirmTouched = false;
  showToast = false;
  isSubmitting = false;

  submitError = '';

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly authService = inject(AuthService);
  private readonly oobCode = inject(ActivatedRoute).snapshot.queryParamMap.get('oobCode') ?? '';

  /** Injects the router used for navigation after the password was reset. */
  constructor(private readonly router: Router) {}


  /** Cancels a pending redirect timer when the component is destroyed. */
  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }


  /** Checks that the new password has at least 8 characters. */
  isPasswordValid(): boolean {
    return this.password.trim().length >= 8;
  }


  /** Checks that the confirmation is filled and matches the password. */
  doPasswordsMatch(): boolean {
    return this.confirmPassword.length > 0 && this.password === this.confirmPassword;
  }


  /** Checks that the password is valid and both entries match. */
  isFormValid(): boolean {
    return this.isPasswordValid() && this.doPasswordsMatch();
  }


  /** Returns true if the password field was touched and its value is invalid. */
  showPasswordError(): boolean {
    return this.passwordTouched && !this.isPasswordValid();
  }


  /** Returns true if the confirmation field was touched and does not match the password. */
  showConfirmError(): boolean {
    return this.confirmTouched && !this.doPasswordsMatch();
  }


  /** Returns the lock icon path, highlighted while the field is focused or filled. */
  getLockIcon(focused: boolean, value: string): string {
    const isActive = focused || value.trim().length > 0;
    return isActive ? 'assets/icons/lock-black.svg' : 'assets/icons/lock.svg';
  }


  /** Clears the password focus state and marks the field as touched if it has a value. */
  onPasswordBlur(): void {
    this.passwordFocused = false;
    if (this.password.length > 0) {
      this.passwordTouched = true;
    }
  }


  /** Clears the confirmation focus state and marks the field as touched if it has a value. */
  onConfirmBlur(): void {
    this.confirmFocused = false;
    if (this.confirmPassword.length > 0) {
      this.confirmTouched = true;
    }
  }


  /** Validates the form and applies the new password. */
  onSubmit(): void {
    this.passwordTouched = true;
    this.confirmTouched = true;
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }
    this.applyNewPassword();
  }


  /** Confirms the password reset with the reset code and shows the success toast, or sets an error message on failure. */
  private async applyNewPassword(): Promise<void> {
    this.isSubmitting = true;
    this.submitError = '';
    try {
      await this.authService.confirmReset(this.oobCode, this.password);
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
