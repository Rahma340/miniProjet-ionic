import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order } from '../../../models/order.model';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartItem } from 'src/app/models/CartItem';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  items: CartItem[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe((items) => {
      this.items = items;
      this.total = this.calculateTotal(items);
    });
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce(
      (sum, i) => sum + Number(i.product.price) * i.quantity,
      0
    );
  }

  updateQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    this.cartService.updateQuantity(item.product.id!, newQty);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  /** 🔹 Passer commande ou rediriger */
  async checkout() {
    const uid = this.authService.getCurrentUid();

    // ⚠️ Si non connecté → toast + redirection vers register
    if (!uid) {
      const toast = await this.toastController.create({
        message: 'Veuillez vous connecter pour passer commande 🛒',
        duration: 2000,
        color: 'warning',
        position: 'top',
      });
      await toast.present();
      this.router.navigate(['/register']);
      return;
    }

    // ✅ Si connecté → créer la commande
    const order: Order = {
      userId: uid,
      items: this.items.map((i) => ({
        productId: i.product.id!,
        name: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
      })),
      total: this.total,
      status: 'pending',
      date: new Date().toISOString(),
    };

    const orderId = await this.orderService.createOrder(order);
    this.cartService.clearCart();

    // ✅ Confirmation + redirection vers la page des commandes
    const toast = await this.toastController.create({
      message: `Commande placée avec succès ! Réf : ${orderId}`,
      duration: 2500,
      color: 'success',
      position: 'top',
    });
    await toast.present();

    this.router.navigate(['/client/orders']);
  }
}
