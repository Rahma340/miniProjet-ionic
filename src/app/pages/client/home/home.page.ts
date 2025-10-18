import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; // ✅ à ajouter

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  cartCount = 0;
  isLoggedIn = false; // ✅ état utilisateur

  categories = [
    { name: 'Électronique', slug: 'electronique', image: 'assets/categories/electronics.jpg' },
    { name: 'Mode & Accessoires', slug: 'mode-accessoires', image: 'assets/categories/fashion.jpg' },
    { name: 'Maison & Cuisine', slug: 'maison-cuisine', image: 'assets/categories/home.jpg' },
    { name: 'Beauté & Santé', slug: 'beaute-sante', image: 'assets/categories/beauty.jpg' },
    { name: 'Sports & Loisirs', slug: 'sports-loisirs', image: 'assets/categories/sport.jpg' },
  ];

  productsByCategory: { [key: string]: Product[] } = {};
  filteredProductsByCategory: { [key: string]: Product[] } = {};
  searchQuery = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService // ✅ injecte AuthService
  ) {}

  ngOnInit() {
    // 🔹 Suivre le panier
    this.cartService.cartCount$.subscribe(count => (this.cartCount = count));

    // 🔹 Suivre l’état de connexion en direct
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // 🔹 Charger les produits par catégorie
    this.categories.forEach(cat => {
      this.productService.getProductsByCategory(cat.name).subscribe(data => {
        this.productsByCategory[cat.slug] = data;
        this.filteredProductsByCategory[cat.slug] = data;
      });
    });
  }

  // 🔹 Déconnexion
  logout() {
    this.authService.logout();
  }

  // 🔹 Recherche produit
  onSearch(event: any) {
    const value = (event.detail.value || '').toLowerCase();
    this.searchQuery = value;

    if (!value) {
      this.filteredProductsByCategory = { ...this.productsByCategory };
      return;
    }

    this.filteredProductsByCategory = {};
    Object.keys(this.productsByCategory).forEach(slug => {
      this.filteredProductsByCategory[slug] = this.productsByCategory[slug].filter(p =>
        p.name?.toLowerCase().includes(value)
      );
    });
  }

  // 🔹 Aller au détail produit
  goToDetails(product: Product) {
    this.router.navigate(['/client/product-details', product.id]);
  }
}
