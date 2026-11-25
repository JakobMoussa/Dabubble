import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isValidEmail } from '../../shared/validators/email.validator';
import { AuthService } from '../../services/auth.service';
import { toAuthMessage } from '../../shared/auth-error-messages';

export interface AvatarOption {
  name: string;
  src: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnDestroy {
  step: 'form' | 'avatar' = 'form';
  fullName = '';
  email = '';
  password = '';
  privacyAccepted = false;
  selectedAvatar = '';
  uploadError = '';
  showToast = false;
  isSubmitting = false;

  nameFocused = false;
  emailFocused = false;
  passwordFocused = false;
  nameTouched = false;
  emailTouched = false;
  passwordTouched = false;
  privacyTouched = false;

  readonly avatarOptions: AvatarOption[] = [
    { name: 'Elias Neumann', src: 'assets/img/elias-neumann.png' },
    { name: 'Elise Roth', src: 'assets/img/elise-roth.png' },
    { name: 'Frederik Beck', src: 'assets/img/frederik-beck.png' },
    { name: 'Noah Braun', src: 'assets/img/noah-braun.png' },
    { name: 'Sofia Müller', src: 'assets/img/sofia-mueller.png' },
    { name: 'Steffen Hoffmann', src: 'assets/img/steffen-hoffmann.png' }
  ];

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly namePattern = /^[\p{L}\p{M}'-]+(?:\s+[\p{L}\p{M}'-]+)+$/u;

  private readonly authService = inject(AuthService);

  /** Injects the router used for navigation after registration. */
  constructor(private readonly router: Router) { }


  /** Cancels a pending redirect timer when the component is destroyed. */
  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }


  /** Checks that the full name consists of at least a first and a last name. */
  isNameValid(): boolean {
    return this.namePattern.test(this.fullName.trim());
  }


  /** Checks whether the entered email address is valid. */
  isEmailValid(): boolean {
    return isValidEmail(this.email);
  }


  /** Checks that the password has at least 8 characters. */
  isPasswordValid(): boolean {
    return this.password.trim().length >= 8;
  }


  /** Checks that all fields of the first step are valid and the privacy policy is accepted. */
  isStepOneValid(): boolean {
    return (
      this.isNameValid() &&
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.privacyAccepted
    );
  }


  /** Returns true if the name field was touched and its value is invalid. */
  showNameError(): boolean {
    return this.nameTouched && !this.isNameValid();
  }


  /** Returns true if the email field was touched and its value is invalid. */
  showEmailError(): boolean {
    return this.emailTouched && !this.isEmailValid();
  }


  /** Returns true if the password field was touched and its value is invalid. */
  showPasswordError(): boolean {
    return this.passwordTouched && !this.isPasswordValid();
  }


  /** Returns true if the privacy checkbox was touched but not accepted. */
  showPrivacyError(): boolean {
    return this.privacyTouched && !this.privacyAccepted;
  }


  /** Returns true if a field is focused or has a non-empty value. */
  isFieldActive(focused: boolean, value: string): boolean {
    return focused || value.trim().length > 0;
  }


  /** Returns the mail icon path, highlighted while the field is active. */
  getMailIcon(): string {
    return this.isFieldActive(this.emailFocused, this.email)
      ? 'assets/icons/mail-black.svg'
      : 'assets/icons/mail.svg';
  }


  /** Returns the lock icon path, highlighted while the field is active. */
  getLockIcon(): string {
    return this.isFieldActive(this.passwordFocused, this.password)
      ? 'assets/icons/lock-black.svg'
      : 'assets/icons/lock.svg';
  }


  /** Clears the name focus state and marks the field as touched if it has a value. */
  onNameBlur(): void {
    this.nameFocused = false;
    if (this.fullName.length > 0) {
      this.nameTouched = true;
    }
  }


  /** Clears the email focus state and marks the field as touched if it has a value. */
  onEmailBlur(): void {
    this.emailFocused = false;
    if (this.email.length > 0) {
      this.emailTouched = true;
    }
  }


  /** Clears the password focus state and marks the field as touched if it has a value. */
  onPasswordBlur(): void {
    this.passwordFocused = false;
    if (this.password.length > 0) {
      this.passwordTouched = true;
    }
  }


  /** Marks the privacy checkbox as touched. */
  onPrivacyChange(): void {
    this.privacyTouched = true;
  }


  /** Moves to the avatar step if the first step is valid. */
  onProceedToAvatar(): void {
    this.markFormTouched();
    if (!this.isStepOneValid()) {
      return;
    }
    this.step = 'avatar';
  }


  /** Marks all fields of the first step as touched. */
  private markFormTouched(): void {
    this.nameTouched = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.privacyTouched = true;
  }


  /** Returns to the form step. */
  goBackToForm(): void {
    this.step = 'form';
  }


  /** Selects an avatar and clears any upload error. */
  selectAvatar(src: string): void {
    this.uploadError = '';
    this.selectedAvatar = src;
  }

  /** Registers the user with the selected avatar and shows the success toast, or sets an error message on failure. */
  async onCreateAccount(): Promise<void> {
    if (!this.selectedAvatar || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    try {
      await this.registerUser();
      this.showSuccessAndRedirect();
    } catch (error) {
      this.uploadError = toAuthMessage(error);
      this.isSubmitting = false;
    }
  }


  /** Registers the user through the auth service with the entered data and selected avatar. */
  private registerUser(): Promise<void> {
    return this.authService.register({
      name: this.fullName,
      email: this.email,
      password: this.password,
      avatar: this.selectedAvatar
    });
  }


  /** Shows the success toast and redirects to the dashboard after a short delay. */
  private showSuccessAndRedirect(): void {
    this.showToast = true;
    this.redirectTimer = setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1800);
  }
}
