import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order } from '../../../models/order.model';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartItem } from 'src/app/models/CartItem';

@Component({
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  items: CartItem[] = []; // Tableau des articles dans le panier
  total = 0; // Total du panier

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // S'abonner aux changements du panier pour mettre à jour items et total
    this.cartService.cart$.subscribe((items) => {
      this.items = items;
      this.total = this.calculateTotal(items);
    });
  }

  /** Calculer le total du panier */
  private calculateTotal(items: CartItem[]): number {
    return items.reduce(
      (sum, i) => sum + Number(i.product.price) * i.quantity,
      0
    );
  }

  /** Mettre à jour la quantité d'un article dans le panier */
  updateQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta; // Calculer la nouvelle quantité
    if (newQty < 1) return; // Empêcher une quantité inférieure à 1
    this.cartService.updateQuantity(item.product.id!, newQty); // Mettre à jour dans le service
  }

  /** Supprimer un article du panier */
  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  /** Passer la commande */
  async checkout() {
    // Récupérer l'UID de l'utilisateur courant
    this.authService.getCurrentUid().subscribe(async uid => {
      if (!uid) {
        // Si l'utilisateur n'est pas connecté, afficher un message et rediriger
        const toast = await this.toastController.create({
          message: 'Veuillez vous connecter pour passer commande',
          duration: 2000,
          color: 'warning',
          position: 'top',
        });
        await toast.present();
        this.router.navigate(['/register']);
        return;
      }

      // Préparer l'objet commande
      const order: Order = {
        userId: uid, 
        items: this.items.map(i => ({
          productId: i.product.id!,
          name: i.product.name,
          price: Number(i.product.price),
          quantity: i.quantity,
        })),
        total: this.total,
        status: 'pending', // Statut initial
        date: new Date().toISOString(),
      };

      // Créer la commande dans Firestore
      const orderId = await this.orderService.createOrder(order);

      // Vider le panier
      this.cartService.clearCart();

      // Afficher confirmation
      const toast = await this.toastController.create({
        message: `Commande placée avec succès ! Réf : ${orderId}`,
        duration: 2500,
        color: 'success',
        position: 'top',
      });
      await toast.present();

      // Rediriger vers la page des commandes
      this.router.navigate(['/client/orders']);
    });
  }
}
