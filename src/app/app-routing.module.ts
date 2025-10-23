import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './pages/admin/dashboard/dashboard.page';

const routes: Routes = [
  // 🔹 Redirection par défaut
  { path: '', redirectTo: 'client/home', pathMatch: 'full' },

  // =============================
  // 🔸 ADMIN ROUTES
  // =============================
 {
  path: 'admin',
  component: DashboardPage,
  children: [
    {
      path: 'list-product',
      loadChildren: () => import('./pages/admin/products/list-product/list-product.module').then(m => m.ListProductPageModule)
    },
    {
      path: 'add-product',
      loadChildren: () => import('./pages/admin/products/product/product.module').then(m => m.ProductPageModule)
    },
    
    {
      path: '',
      redirectTo: 'list-product',
      pathMatch: 'full'
    }
  ]
}
,

  // =============================
  // 🔸 CLIENT ROUTES
  // =============================
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/client/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/client/register/register.module').then(
        (m) => m.RegisterPageModule
      ),
  },
  {
    path: 'client/home',
    loadChildren: () =>
      import('./pages/client/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'client/product-details/:id',
    loadChildren: () =>
      import('./pages/client/product-details/product-details.module').then(
        (m) => m.ProductDetailsPageModule
      ),
  },
  {
    path: 'client/cart',
    loadChildren: () =>
      import('./pages/client/cart/cart.module').then((m) => m.CartPageModule),
  },
  {
    path: 'client/orders',
    loadChildren: () =>
      import('./pages/client/orders/orders.module').then(
        (m) => m.OrdersPageModule
      ),
  },
  {
    path: 'client/category/:category',
    loadChildren: () =>
      import('./pages/client/category-product/category-product.module').then(
        (m) => m.CategoryProductPageModule
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
