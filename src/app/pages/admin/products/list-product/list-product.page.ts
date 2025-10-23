import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.page.html',
  styleUrls: ['./list-product.page.scss'],
  standalone: false
})
export class ListProductPage implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = false;

  private productsSub?: Subscription;

  constructor(
    private router: Router,
    private productService: ProductService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loading = true;
    // S'abonner au BehaviorSubject
    this.productsSub = this.productService.productsByCategory$.subscribe(data => {
      // Créer une liste plate à partir des catégories
      // Aplatir les tableaux de produits par catégorie sans flat()
this.products = Object.values(data).reduce((acc, val) => acc.concat(val), [] as Product[]);

      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.productsSub?.unsubscribe();
  }

  addProduct() {
    this.router.navigate(['/admin/add-product']);
  }

  editProduct(productId: string) {
    this.router.navigate(['/admin/add-product', productId]);
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer "${product.name}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.productService.deleteProduct(product.id!);
              const toast = await this.toastController.create({
                message: 'Produit supprimé avec succès',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            } catch (err) {
              console.error('Erreur suppression produit', err);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
