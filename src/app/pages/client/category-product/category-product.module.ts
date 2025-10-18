import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CategoryProductPageRoutingModule } from './category-product-routing.module';
import { CategoryProductPage } from './category-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // ✅ C'est ça qui permet de reconnaître les <ion-*> !
    CategoryProductPageRoutingModule
  ],
  declarations: [CategoryProductPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ pour éviter les erreurs sur les Web Components Ionic
})
export class CategoryProductPageModule {}
