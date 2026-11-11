import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
        { name: 'Elias Neumann', src: 'assets/img/Elias Neumann.png' },
        { name: 'Elise Roth', src: 'assets/img/Elise Roth.png' },
        { name: 'Frederik Beck', src: 'assets/img/Frederik Beck.png' },
        { name: 'Noah Braun', src: 'assets/img/Noah Braun.png' },
        { name: 'Sofia Müller', src: 'assets/img/Sofia Müller.png' },
        { name: 'Steffen Hoffmann', src: 'assets/img/Steffen Hoffmann.png' }
    ];

    private redirectTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly namePattern = /^[\p{L}\p{M}'-]+(?:\s+[\p{L}\p{M}'-]+)+$/u;
    private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    constructor(private readonly router: Router) { }


    ngOnDestroy(): void {
        if (this.redirectTimer) {
            clearTimeout(this.redirectTimer);
        }
    }


    isNameValid(): boolean {
        return this.namePattern.test(this.fullName.trim());
    }


    isEmailValid(): boolean {
        return this.emailPattern.test(this.email.trim());
    }


    isPasswordValid(): boolean {
        return this.password.trim().length >= 8;
    }


    isStepOneValid(): boolean {
        return (
            this.isNameValid() &&
            this.isEmailValid() &&
            this.isPasswordValid() &&
            this.privacyAccepted
        );
    }


    showNameError(): boolean {
        return this.nameTouched && !this.isNameValid();
    }


    showEmailError(): boolean {
        return this.emailTouched && !this.isEmailValid();
    }


    showPasswordError(): boolean {
        return this.passwordTouched && !this.isPasswordValid();
    }


    showPrivacyError(): boolean {
        return this.privacyTouched && !this.privacyAccepted;
    }


    isFieldActive(focused: boolean, value: string): boolean {
        return focused || value.trim().length > 0;
    }


    getMailIcon(): string {
        return this.isFieldActive(this.emailFocused, this.email)
            ? 'assets/icons/mail-black.svg'
            : 'assets/icons/mail.svg';
    }


    getLockIcon(): string {
        return this.isFieldActive(this.passwordFocused, this.password)
            ? 'assets/icons/lock-black.svg'
            : 'assets/icons/lock.svg';
    }


    onNameBlur(): void {
        this.nameFocused = false;
        if (this.fullName.length > 0) {
            this.nameTouched = true;
        }
    }


    onEmailBlur(): void {
        this.emailFocused = false;
        if (this.email.length > 0) {
            this.emailTouched = true;
        }
    }


    onPasswordBlur(): void {
        this.passwordFocused = false;
        if (this.password.length > 0) {
            this.passwordTouched = true;
        }
    }


    onPrivacyChange(): void {
        this.privacyTouched = true;
    }


    onProceedToAvatar(): void {
        this.markFormTouched();
        if (!this.isStepOneValid()) {
            return;
        }
        this.step = 'avatar';
    }


    private markFormTouched(): void {
        this.nameTouched = true;
        this.emailTouched = true;
        this.passwordTouched = true;
        this.privacyTouched = true;
    }


    goBackToForm(): void {
        this.step = 'form';
    }


    selectAvatar(src: string): void {
        this.uploadError = '';
        this.selectedAvatar = src;
    }

    private readAvatarFile(file: File): void {
        if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
            this.uploadError = '*Bitte wähle ein Bild unter 2 MB aus.';
            return;
        }
        this.uploadError = '';
        const reader = new FileReader();
        reader.onload = () => {
            this.selectedAvatar = String(reader.result ?? '');
        };
        reader.readAsDataURL(file);
    }


    onCreateAccount(): void {
        if (!this.selectedAvatar || this.isSubmitting) {
            return;
        }
        this.isSubmitting = true;
        this.showToast = true;
        this.redirectTimer = setTimeout(() => {
            this.router.navigate(['/login']);
        }, 1800);
    }
}
