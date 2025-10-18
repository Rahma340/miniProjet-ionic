import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // ✅ Import du module Ionic
import { RouterModule } from '@angular/router';

import { LoginPage } from './login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // ✅ permet d'utiliser <ion-button>, <ion-icon>, etc.
    RouterModule.forChild([
      {
        path: '',
        component: LoginPage,
      },
    ]),
  ],
  declarations: [LoginPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
})
export class LoginPageModule {}
