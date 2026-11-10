import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(private readonly router: Router) {}


  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }


  isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
  }


  showEmailError(): boolean {
    return this.emailTouched && !this.isEmailValid();
  }


  getMailIcon(): string {
    const isActive = this.emailFocused || this.email.trim().length > 0;
    return isActive ? 'assets/icons/mail-black.svg' : 'assets/icons/mail.svg';
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
    if (this.isEmailValid()) {
      this.emailTouched = false;
    }
  }


  onSubmit(): void {
    this.emailTouched = true;
    if (!this.isEmailValid() || this.isSubmitting) {
      return;
    }
    this.sendResetEmail();
  }


  private sendResetEmail(): void {
    this.isSubmitting = true;
    this.showToast = true;
    this.redirectTimer = setTimeout(() => {
      this.router.navigate(['/reset-password']);
    }, 1800);
  }
}
