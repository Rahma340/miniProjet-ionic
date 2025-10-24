import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

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
  ];

  productsByCategory: { [key: string]: Product[] } = {};
  filteredProductsByCategory: { [key: string]: Product[] } = {};
  searchQuery = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // S’abonne au nombre d’articles du panier
    const cartSub = this.cartService.cartCount$.subscribe(count => (this.cartCount = count));
    this.subscriptions.push(cartSub);

    // Vérification de l'utilisateur connecté
    const authSub = this.authService.currentUser$.subscribe(async user => {
      this.isLoggedIn = !!user;

      if (user?.uid) {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          this.userRole = data['role'] as 'client' | 'admin';

          // Redirection automatique selon le rôle
          if (this.userRole === 'admin') {
            this.router.navigate(['/admin/products']);
          } else if (this.userRole === 'client') {
            this.router.navigate(['/client/home']);
          }
        }
      }
    });
    this.subscriptions.push(authSub);

    // S’abonner aux produits par catégorie
    const productsSub = this.productService.productsByCategory$.subscribe(allProducts => {
      this.productsByCategory = {};
      this.filteredProductsByCategory = {};
      //On récupère les produits correspondant à la catégorie
      this.categories.forEach(cat => {

        const products = allProducts[cat.name] || [];
        this.productsByCategory[cat.slug] = products;
        this.filteredProductsByCategory[cat.slug] = products;
      });
    });
    this.subscriptions.push(productsSub);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login')
  }

  onSearch(event: any) {
    const value = (event.detail.value || '').toLowerCase();
    this.searchQuery = value;
    //Si value est vide on réinitialise les produits filtrés pour afficher tous les produits
    if (!value) {
      this.filteredProductsByCategory = { ...this.productsByCategory };
      return;
    }

    this.filteredProductsByCategory = {};
    //récupère tous les slugs de catégories
    Object.keys(this.productsByCategory).forEach(slug => {
    //Pour chaque catégorie on filtre les produits dont le nom contient le texte recherché   
      this.filteredProductsByCategory[slug] = this.productsByCategory[slug].filter(p =>
        p.name.toLowerCase().includes(value)
      );
    });
  }

  goToDetails(product: Product) {
    this.router.navigate(['/client/product-details', product.id]);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
