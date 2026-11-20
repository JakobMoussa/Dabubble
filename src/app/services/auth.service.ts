import { Injectable, inject } from '@angular/core';
import {
  Auth, GoogleAuthProvider, User, authState, confirmPasswordReset,
  createUserWithEmailAndPassword, sendPasswordResetEmail, signInAnonymously,
  signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AppUser } from '../models/user.model';
import { normalizeEmail } from '../shared/validators/email.validator';
import { UserService } from './user.service';

export const DEFAULT_AVATAR = 'assets/img/avatars/default.svg';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly users = inject(UserService);
  readonly user$: Observable<User | null> = authState(this.auth);


  get currentUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }


  async register(data: RegisterData): Promise<void> {
    const email = normalizeEmail(data.email);
    const name = data.name.trim();
    const { user } = await createUserWithEmailAndPassword(this.auth, email, data.password);
    await updateProfile(user, { displayName: name, photoURL: data.avatar });
    await this.users.createProfile(this.buildProfile(user.uid, name, email, data.avatar, false));
  }


  async login(email: string, password: string): Promise<void> {
    const { user } = await signInWithEmailAndPassword(this.auth, normalizeEmail(email), password);
    await this.users.setStatus(user.uid, 'online');
  }


  async loginWithGoogle(): Promise<void> {
    const { user } = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.ensureProfile(user, false);
    await this.users.setStatus(user.uid, 'online');
  }


  async loginAsGuest(): Promise<void> {
    const { user } = await signInAnonymously(this.auth);
    await this.ensureProfile(user, true);
    await this.users.setStatus(user.uid, 'online');
  }


  sendResetMail(email: string): Promise<void> {
    const url = `${location.origin}${location.pathname.replace(/\/[^/]*$/, '')}/login`;
    return sendPasswordResetEmail(this.auth, normalizeEmail(email), { url });
  }


  confirmReset(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.auth, oobCode, newPassword);
  }


  async logout(): Promise<void> {
    const uid = this.currentUid;
    if (uid) {
      await this.users.setStatus(uid, 'offline');
    }
    await signOut(this.auth);
  }


  private async ensureProfile(user: User, isGuest: boolean): Promise<void> {
    if (await this.users.profileExists(user.uid)) {
      return;
    }
    const name = isGuest ? 'Gast' : user.displayName ?? 'Neuer Nutzer';
    const avatar = isGuest ? DEFAULT_AVATAR : user.photoURL ?? DEFAULT_AVATAR;
    await this.users.createProfile(this.buildProfile(user.uid, name, user.email ?? '', avatar, isGuest));
  }


  private buildProfile(uid: string, name: string, email: string, avatar: string, isGuest: boolean): AppUser {
    return { uid, name, email, avatar, status: 'online', isGuest };
  }
}
