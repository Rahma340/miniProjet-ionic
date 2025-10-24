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
  providedIn: 'root', })
export class FirebaseAuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  /**
   * Enregistrer un nouvel utilisateur avec email et mot de passe
   * et créer son profil dans Firestore
   */
  async register(
    email: string,
    password: string,
    nom: string,
    prenom: string
  ): Promise<UserCredential> {
    // Crée l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Crée un document utilisateur dans Firestore avec role et date de création
    await setDoc(doc(this.firestore, 'users', user.uid), {
      email,
      nom,
      prenom,
      role: 'user', // rôle par défaut
      createdAt: new Date().toISOString(),
    });

    return userCredential; // Retourne l'objet UserCredential
  }

  /**
   * Connexion d'un utilisateur existant avec email et mot de passe
   */
  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Récupérer l'UID de l'utilisateur actuellement connecté
   */
  getCurrentUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  /**
   * Déconnecter l'utilisateur actuel
   */
  async logout() {
    return signOut(this.auth);
  }

  /**
   * Récupérer les informations de l'utilisateur depuis Firestore
   * @param uid ID de l'utilisateur
   */
  async getUserData(uid: string) {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
}
