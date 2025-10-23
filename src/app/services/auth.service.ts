import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private router = inject(Router);

  constructor(private auth: Auth, private firestore: Firestore) {
    
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

 
  async register(email: string, password: string, role: 'client' | 'admin' = 'client', displayName?: string) {
    const userCred = await createUserWithEmailAndPassword(this.auth, email, password);
    const userRef = doc(this.firestore, `users/${userCred.user.uid}`);

    await setDoc(userRef, {
      uid: userCred.user.uid,
      email,
      role,
      displayName: displayName || null,
      createdAt: new Date().toISOString(),
    });

    return userCred.user;
  }

  // Connexion d’un utilisateur 
  async login(email: string, password: string) {
    const userCred = await signInWithEmailAndPassword(this.auth, email, password);
    const userDoc = await getDoc(doc(this.firestore, `users/${userCred.user.uid}`));
    return userDoc.exists() ? userDoc.data() : null;
  }

  //Déconnexion 
  async logout() {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null); 
      this.router.navigate(['/login']); 
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
    }
  }

  
  getCurrentUid(): string | null {
    return this.auth.currentUser?.uid || null;
  }


  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }
}
