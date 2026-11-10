import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
    }, 2600);
  }

  isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
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

  private performLogin(): void {
    this.authError = '';
  }

  onGuestLogin(): void {
    this.authError = '';
    this.emailTouched = false;
    this.passwordTouched = false;
  }

  onGoogleLogin(): void {
    this.authError = '';
  }
}
