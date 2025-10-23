import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.page.html',
  styleUrls: ['./list-product.page.scss'],
  standalone: false,
})
export class ListProductPage implements OnInit {
  products: Product[] = [];
  loading = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  ionViewWillEnter() {
    this.loadProducts();
  }

  async loadProducts() {
    this.loading = true;
    try {
      const data = await this.productService.getProducts();
      this.products = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      this.products = [];
    } finally {
      this.loading = false;
    }
  }

  addProduct() {
    this.router.navigate(['/admin/add-product']);
  }

  editProduct(productId: string) {
    if (!productId) return;
    this.router.navigate(['/admin/edit-product', productId]);
  }

  async deleteProduct(productId: string, productName: string) {
    if (!productId) return;

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer "${productName}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.productService.deleteProduct(productId);
              await this.loadProducts();
            } catch (err) {
              console.error('Erreur suppression produit:', err);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
