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
import { ChannelService } from './channel.service';
import { DraftStore } from './draft.store';

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
  private readonly channels = inject(ChannelService);
  private readonly drafts = inject(DraftStore);
  readonly user$: Observable<User | null> = authState(this.auth);


  /** Uid of the signed-in user, or null when nobody is signed in. */
  get currentUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }


  /** Creates the auth account, stores the profile and joins the default channels. */
  async register(data: RegisterData): Promise<void> {
    const email = normalizeEmail(data.email);
    const name = data.name.trim();
    const { user } = await createUserWithEmailAndPassword(this.auth, email, data.password);
    await updateProfile(user, { displayName: name, photoURL: data.avatar });
    await this.users.createProfile(this.buildProfile(user.uid, name, email, data.avatar, false));
    await this.channels.joinDefaultChannels(user.uid);
  }


  /** Signs in with email and password and marks the user online. */
  async login(email: string, password: string): Promise<void> {
    const { user } = await signInWithEmailAndPassword(this.auth, normalizeEmail(email), password);
    await this.users.setStatus(user.uid, 'online');
  }


  /** Signs in via Google popup, creates a profile on first login and marks the user online. */
  async loginWithGoogle(): Promise<void> {
    const { user } = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.ensureProfile(user, false);
    await this.users.setStatus(user.uid, 'online');
  }


  /** Signs in anonymously as a guest, creates a guest profile if needed and marks the user online. */
  async loginAsGuest(): Promise<void> {
    const { user } = await signInAnonymously(this.auth);
    await this.ensureProfile(user, true);
    await this.users.setStatus(user.uid, 'online');
  }


  /** Sends a password reset mail that links back to the login page. */
  sendResetMail(email: string): Promise<void> {
    const url = `${location.origin}${location.pathname}#/login`;
    return sendPasswordResetEmail(this.auth, normalizeEmail(email), { url });
  }


  /** Sets a new password using the code from the reset mail. */
  confirmReset(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.auth, oobCode, newPassword);
  }


  /** Marks the user offline and signs out. */
  async logout(): Promise<void> {
    const uid = this.currentUid;
    if (uid) {
      await this.users.setStatus(uid, 'offline');
    }
    this.drafts.clear();
    await signOut(this.auth);
  }


  /** Creates the profile and joins the default channels if the user has no profile yet. */
  private async ensureProfile(user: User, isGuest: boolean): Promise<void> {
    if (await this.users.profileExists(user.uid)) {
      return;
    }
    const name = isGuest ? 'Gast' : user.displayName ?? 'Neuer Nutzer';
    const avatar = isGuest ? DEFAULT_AVATAR : user.photoURL ?? DEFAULT_AVATAR;
    await this.users.createProfile(this.buildProfile(user.uid, name, user.email ?? '', avatar, isGuest));
    await this.channels.joinDefaultChannels(user.uid);
  }


  /** Builds a new online profile object for the given account data. */
  private buildProfile(uid: string, name: string, email: string, avatar: string, isGuest: boolean): AppUser {
    return { uid, name, email, avatar, status: 'online', isGuest };
  }
}
