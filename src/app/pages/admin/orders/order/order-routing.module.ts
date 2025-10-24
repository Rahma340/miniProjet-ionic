import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersAdminPage } from './order.page';

const routes: Routes = [
  {
    path: '',
    component: OrdersAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersAdminPageRoutingModule {}
