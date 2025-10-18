import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  /** 🔹 Inscription utilisateur avec rôle "user" par défaut */
  async register(
    email: string,
    password: string,
    nom: string,
    prenom: string
  ): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Ajout Firestore
    await setDoc(doc(this.firestore, 'users', user.uid), {
      email,
      nom,
      prenom,
      role: 'user', // 🔹 Par défaut : utilisateur normal
      createdAt: new Date().toISOString(),
    });

    return userCredential;
  }

  /** 🔹 Connexion */
  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /** 🔹 UID actuel */
  getCurrentUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  /** 🔹 Déconnexion */
  async logout() {
    return signOut(this.auth);
  }

  /** 🔹 Récupérer les infos Firestore */
  async getUserData(uid: string) {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
}
