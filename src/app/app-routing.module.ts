import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'client/home', pathMatch: 'full' },

  // Client
  { 
    path: 'client/home', 
    loadChildren: () => import('./pages/client/home/home.module')
      .then(m => m.HomePageModule) 
  },
  { 
    path: 'client/product-details/:id', 
    loadChildren: () => import('./pages/client/product-details/product-details.module')
      .then(m => m.ProductDetailsPageModule) 
  },
  { 
    path: 'client/cart', 
    loadChildren: () => import('./pages/client/cart/cart.module')
      .then(m => m.CartPageModule) 
  },
  { 
    path: 'client/orders', 
    loadChildren: () => import('./pages/client/orders/orders.module')
      .then(m => m.OrdersPageModule) 
  },

  // Admin (désactivé pour l’instant)
  // { path: 'admin/dashboard', loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then(m => m.AdminDashboardPageModule) },
  // { path: 'admin/add-product', loadChildren: () => import('./pages/admin/add-product/add-product.module').then(m => m.AddProductPageModule) },
  // { path: 'admin/orders', loadChildren: () => import('./pages/admin/orders/orders.module').then(m => m.AdminOrdersPageModule) },

  // Auth (désactivé pour l’instant)
  // { path: 'auth/login', loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule) },
  // { path: 'auth/register', loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule) },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
