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
      message: role === 'admin' ? 'Bienvenue Administrateur !' : 'Connexion réussie ',
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
    if (!emailRegex.test(this.email)) {
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
      const userCredential = await this.authService.login(this.email, this.password);
      const user = userCredential.user;

      const userData = await this.firestoreService.getDocumentData('users', user.uid);
      await this.showSuccessToast(userData?.role || 'user');

      // 🔹 Redirection selon le rôle
      if (userData?.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/client/home']);
      }

    } catch (error: any) {
      console.error('Erreur Firebase Auth:', error);
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Format d\'email invalide';
      } else {
        this.errorMessage = 'Erreur de connexion';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
