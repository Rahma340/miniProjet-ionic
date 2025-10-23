import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  cartCount = 0;
  isLoggedIn = false;
  userRole: 'client' | 'admin' | null = null;

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
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // 🔹 Mise à jour du panier
    this.cartService.cartCount$.subscribe(count => (this.cartCount = count));

    // 🔹 Vérification de l'utilisateur connecté
    this.authService.currentUser$.subscribe(async user => {
      this.isLoggedIn = !!user;

      if (user?.uid) {
        // On récupère le document utilisateur
        const userRef = doc(this.firestore, `users/${user.uid}`);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          this.userRole = data['role'] as 'client' | 'admin';

          // 🔸 Redirection automatique selon le rôle
          if (this.userRole === 'admin') {
            this.router.navigate(['/admin/products']);
          } else if (this.userRole === 'client') {
            this.router.navigate(['/client/home']);
          }
        }
      }
    });

    // 🔹 Charger les produits par catégorie
    this.categories.forEach(cat => {
      this.productService.getProductsByCategory(cat.name).subscribe(data => {
        this.productsByCategory[cat.slug] = data;
        this.filteredProductsByCategory[cat.slug] = data;
      });
    });
  }

  logout() {
    this.authService.logout();
  }

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

  goToDetails(product: Product) {
    this.router.navigate(['/client/product-details', product.id]);
  }
}
