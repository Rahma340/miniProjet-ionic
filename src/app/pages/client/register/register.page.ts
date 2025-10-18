import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  userData = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  passwordStrength = 0;

  constructor(
    private authService: FirebaseAuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordStrength() {
    const password = this.userData.password;
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    this.passwordStrength = Math.min(strength, 100);
  }

  getStrengthColor(): string {
    if (this.passwordStrength < 40) return 'danger';
    if (this.passwordStrength < 70) return 'warning';
    return 'success';
  }

  getStrengthText(): string {
    if (this.passwordStrength < 40) return 'Mot de passe faible';
    if (this.passwordStrength < 70) return 'Mot de passe moyen';
    return 'Mot de passe fort';
  }

  async openTerms(event: Event) {
    event.preventDefault();
    const alert = await this.alertController.create({
      header: 'Conditions d\'utilisation',
      message: 'Ici vous pouvez afficher vos conditions d\'utilisation complètes...',
      buttons: ['OK'],
    });
    await alert.present();
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (
      !this.userData.nom ||
      !this.userData.prenom ||
      !this.userData.email ||
      !this.userData.password
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return false;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }

    return true;
  }

  async showSuccessToast() {
    const toast = await this.toastController.create({
      message: 'Inscription réussie ! Bienvenue 👋',
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  async register() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 🔥 Appel simplifié : pas de champ "role"
      await this.authService.register(
        this.userData.email,
        this.userData.password,
        this.userData.nom,
        this.userData.prenom
      );

      await this.showSuccessToast();
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error(error);
      this.errorMessage =
        error.message || 'Une erreur est survenue lors de l\'inscription';
    } finally {
      this.isLoading = false;
    }
  }
}
