import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  constructor(private auth: Auth, private firestore: Firestore) {}

  /** Observable du User Firebase courant (null si non connecté) */
  currentUser$: Observable<User | null> = new Observable<User | null>(subscriber => {
    return onAuthStateChanged(this.auth, user => subscriber.next(user));
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /** Observable des données Firestore de l’utilisateur courant */
  currentUserData$ = this.currentUser$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      const userRef = doc(this.firestore, `users/${user.uid}`);
      return from(getDoc(userRef)).pipe(
        map(docSnap => docSnap.exists() ? docSnap.data() : null)
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Inscription d’un utilisateur */
  register(
    email: string,
    password: string,
    role: 'client' | 'admin' = 'client',
    displayName?: string
  ): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(async userCred => {
          const userRef = doc(this.firestore, `users/${userCred.user.uid}`);
          await setDoc(userRef, {
            uid: userCred.user.uid,
            email,
            role,
            displayName: displayName || null,
            createdAt: new Date().toISOString(),
          });
          return userCred.user;
        })
    );
  }

  /** Connexion d’un utilisateur */
  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCred =>
        from(getDoc(doc(this.firestore, `users/${userCred.user.uid}`))).pipe(
          map(docSnap => docSnap.exists() ? docSnap.data() : null)
        )
      )
    );
  }

  /** Déconnexion */
  logout(): Observable<any> {
    return from(signOut(this.auth)).pipe(
      map(() => this.router.navigate(['/login']))
    );
  }

  /** UID courant en Observable */
  getCurrentUid(): Observable<string | null> {
    return this.currentUser$.pipe(map(user => user?.uid || null));
  }

  /** Vérifie si un utilisateur est connecté */
  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }
}
