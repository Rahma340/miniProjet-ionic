import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, AsyncPipe, DecimalPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrdersAdminPageRoutingModule } from './order-routing.module';
import { OrdersAdminPage } from './order.page';

@NgModule({
  declarations: [OrdersAdminPage],
  imports: [
    CommonModule,
    IonicModule,
    OrdersAdminPageRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AsyncPipe, DecimalPipe]
})
export class OrdersAdminPageModule {}
