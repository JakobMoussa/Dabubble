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

  constructor(private readonly router: Router) {}


  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }


  isPasswordValid(): boolean {
    return this.password.trim().length >= 8;
  }


  doPasswordsMatch(): boolean {
    return this.confirmPassword.length > 0 && this.password === this.confirmPassword;
  }


  isFormValid(): boolean {
    return this.isPasswordValid() && this.doPasswordsMatch();
  }


  showPasswordError(): boolean {
    return this.passwordTouched && !this.isPasswordValid();
  }


  showConfirmError(): boolean {
    return this.confirmTouched && !this.doPasswordsMatch();
  }


  getLockIcon(focused: boolean, value: string): string {
    const isActive = focused || value.trim().length > 0;
    return isActive ? 'assets/icons/lock-black.svg' : 'assets/icons/lock.svg';
  }


  onPasswordBlur(): void {
    this.passwordFocused = false;
    if (this.password.length > 0) {
      this.passwordTouched = true;
    }
  }


  onConfirmBlur(): void {
    this.confirmFocused = false;
    if (this.confirmPassword.length > 0) {
      this.confirmTouched = true;
    }
  }


  onSubmit(): void {
    this.passwordTouched = true;
    this.confirmTouched = true;
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }
    this.applyNewPassword();
  }


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


  private showSuccessAndRedirect(): void {
    this.showToast = true;
    this.redirectTimer = setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1800);
  }
}
