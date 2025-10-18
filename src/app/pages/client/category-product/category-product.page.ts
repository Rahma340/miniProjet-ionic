import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-category-product',
  templateUrl: './category-product.page.html',
  styleUrls: ['./category-product.page.scss'],
  standalone: false,
})
export class CategoryProductPage implements OnInit {
  categorySlug = '';
  categoryName = '';
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.categorySlug = this.route.snapshot.paramMap.get('category') || '';

    // Map pour convertir le slug en nom de catégorie Firestore
    const categoryMap: Record<string, string> = {
      'electronique': 'Électronique',
      'mode-accessoires': 'Mode & Accessoires',
      'maison-cuisine': 'Maison & Cuisine',
      'beaute-sante': 'Beauté & Santé',
      'sports-loisirs': 'Sports & Loisirs',
    };

    this.categoryName = categoryMap[this.categorySlug] || this.categorySlug;

    // 🔹 Charge les produits de cette catégorie
    this.productService.getProductsByCategory(this.categoryName).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur Firestore:', err);
        this.loading = false;
      }
    });
  }
}
