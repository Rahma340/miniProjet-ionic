import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  isLoading = false;

  constructor(
    private authService: FirebaseAuthService,
    private firestoreService: FirestoreService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async showSuccessToast(role: string) {
    const toast = await this.toastController.create({
      message:
        role === 'admin'
          ? 'Bienvenue, Administrateur '
          : 'Connexion réussie ',
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  validateForm(): boolean {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage = 'Format d\'email invalide';
      return false;
    }

    return true;
  }

  async login() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const userCredential = await this.authService.login(
        this.email.trim(),
        this.password
      );

      const user = userCredential.user;
      if (!user) throw new Error('Utilisateur introuvable');

      const userData = await this.firestoreService.getDocumentData('users', user.uid);
      const role = userData?.role || 'user';
      await this.showSuccessToast(role);

      //  Redirection selon le rôle
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/client/home']);
      }

    } catch (error: any) {
      console.error('Erreur Firebase Auth:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'Aucun compte trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Format d\'email invalide';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Trop de tentatives, veuillez réessayer plus tard';
          break;
        default:
          this.errorMessage = 'Erreur de connexion, veuillez réessayer';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
