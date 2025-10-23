import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // 🔹 Redirection par défaut
  { path: '', redirectTo: 'client/home', pathMatch: 'full' },

    {
    path: 'admin',
    loadChildren: () => import('./pages/admin/products/product/product.module').then( m => m.ProductPageModule)
  },

    {
    path: 'login',
    loadChildren: () =>
      import('./pages/client/login/login.module').then(m => m.LoginPageModule),
  },
{
  path: 'register',
  loadChildren: () =>
    import('./pages/client/register/register.module').then(m => m.RegisterPageModule),
},

  // 🔹 Page d’accueil
  {
    path: 'client/home',
    loadChildren: () =>
      import('./pages/client/home/home.module').then((m) => m.HomePageModule),
  },

  // 🔹 Détails produit
  {
    path: 'client/product-details/:id',
    loadChildren: () =>
      import('./pages/client/product-details/product-details.module').then(
        (m) => m.ProductDetailsPageModule
      ),
  },

  // 🔹 Panier
  {
    path: 'client/cart',
    loadChildren: () =>
      import('./pages/client/cart/cart.module').then((m) => m.CartPageModule),
  },

  // 🔹 Commandes
  {
    path: 'client/orders',
    loadChildren: () =>
      import('./pages/client/orders/orders.module').then(
        (m) => m.OrdersPageModule
      ),
  },

  // 🔹 Produits d’une catégorie
  {
    path: 'client/category/:category',
    loadChildren: () =>
      import('./pages/client/category-product/category-product.module').then(
        (m) => m.CategoryProductPageModule
      ),
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/client/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/client/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./pages/admin/products/product/product.module').then( m => m.ProductPageModule)
  },
  {
    path: 'product',
    loadChildren: () => import('./pages/admin/products/product/product.module').then( m => m.ProductPageModule)
  },

  // 🔹 (Optionnel) route directe vers la page de catégorie
  // utile uniquement si tu veux y accéder sans paramètre
  // {
  //   path: 'category-product',
  //   loadChildren: () =>
  //     import('./pages/client/category-product/category-product.module').then(
  //       (m) => m.CategoryProductPageModule
  //     ),
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
