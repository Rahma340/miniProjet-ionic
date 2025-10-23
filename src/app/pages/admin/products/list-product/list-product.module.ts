import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListProductPageRoutingModule } from './list-product-routing.module';

import { ListProductPage } from './list-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListProductPageRoutingModule
  ],
  declarations: [ListProductPage]
})
export class ListProductPageModule {}
