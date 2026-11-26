import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, docData, getDoc, setDoc, updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser, PresenceStatus } from '../models/user.model';

const USERS = 'users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly firestore = inject(Firestore);


  /** Stores the profile document of a user. */
  createProfile(user: AppUser): Promise<void> {
    return setDoc(doc(this.firestore, USERS, user.uid), user);
  }


  /** Checks whether a profile document exists for the uid. */
  async profileExists(uid: string): Promise<boolean> {
    const snapshot = await getDoc(doc(this.firestore, USERS, uid));
    return snapshot.exists();
  }


  /** Streams the profile of a single user. */
  user$(uid: string): Observable<AppUser | undefined> {
    return docData(doc(this.firestore, USERS, uid)) as Observable<AppUser | undefined>;
  }


  /** Streams all user profiles. */
  allUsers$(): Observable<AppUser[]> {
    return collectionData(collection(this.firestore, USERS)) as Observable<AppUser[]>;
  }


  /** Updates name and avatar of a user. */
  updateProfile(uid: string, changes: Pick<AppUser, 'name' | 'avatar'>): Promise<void> {
    return updateDoc(doc(this.firestore, USERS, uid), { ...changes });
  }


  /** Sets the presence status of a user. */
  setStatus(uid: string, status: PresenceStatus): Promise<void> {
    return updateDoc(doc(this.firestore, USERS, uid), { status, lastSeen: Date.now() });
  }
}
