import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
  standalone: false,
})
export class ProductDetailsPage implements OnInit {
  product?: Product;
  relatedProducts: Product[] = [];

  // ✅ Injection moderne Angular 17+
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastCtrl = inject(ToastController);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productService.getProductById(id).subscribe((data) => {
        this.product = data;

        // Charger quelques produits similaires
        this.productService.getProducts().subscribe((all) => {
          this.relatedProducts = all
            .filter((p) => p.id !== id)
            .slice(0, 4); // max 4 produits similaires
        });
      });
    }
  }
  cartCount = 0;

constructor() {
  this.cartService.cartCount$.subscribe(count => {
    this.cartCount = count;
  });
}


  async addToCart() {
    if (!this.product) return;

    this.cartService.addToCart(this.product, 1);
  }

  goToProduct(p: Product) {
    this.router.navigate(['/client/product-details', p.id]);
  }
}
