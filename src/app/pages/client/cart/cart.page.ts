import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  standalone: false
})
export class CartPage implements OnInit {
  items: CartItem[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 🔹 Récupère le panier et calcule le total
    this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.total = this.calculateTotal(items);
    });
  }

  // 🔹 Calcul du total avec conversion price -> number
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + parseFloat(i.product.price) * i.quantity, 0);
  }

  // 🔹 Passer la commande
  async checkout() {
    const uid = this.authService.getCurrentUid();
    if (!uid) {
      alert('Connectez-vous pour passer commande');
      return;
    }

    // 🔹 Préparer les items pour Order
    const order: Order = {
      userId: uid,
      items: this.items.map(i => ({
        productId: i.product.id!,
        name: i.product.name,
        price: parseFloat(i.product.price), // conversion string -> number
        quantity: i.quantity
      })),
      total: this.calculateTotal(this.items),
      status: 'pending',
      date: new Date().toISOString()
    };

    // 🔹 Créer la commande et vider le panier
    const orderId = await this.orderService.createOrder(order);
    await this.cartService.clearCart();
    alert('Commande placée. Référence: ' + orderId);
  }

  // 🔹 Supprimer un item du panier
  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }
}
