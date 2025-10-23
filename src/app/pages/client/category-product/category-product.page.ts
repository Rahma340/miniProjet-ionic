import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-product',
  templateUrl: './category-product.page.html',
  styleUrls: ['./category-product.page.scss'],
  standalone: false,
})
export class CategoryProductPage implements OnInit, OnDestroy {
  categorySlug = '';
  categoryName = '';
  products: Product[] = [];
  loading = true;

  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.categorySlug = this.route.snapshot.paramMap.get('category') || '';

    const categoryMap: Record<string, string> = {
      'electronique': 'Électronique',
      'mode-accessoires': 'Mode & Accessoires',
      'maison-cuisine': 'Maison & Cuisine',
      'beaute-sante': 'Beauté & Santé',
      'sports-loisirs': 'Sports & Loisirs',
    };

    this.categoryName = categoryMap[this.categorySlug] || this.categorySlug;

    // 🔹 S'abonner aux produits par catégorie
    this.subscription = this.productService.productsByCategory$.subscribe(allProducts => {
      this.products = allProducts[this.categoryName] || [];
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
