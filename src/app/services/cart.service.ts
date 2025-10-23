import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { CartItem } from '../models/CartItem';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];

  // ReplaySubject émet la dernière valeur à tout nouvel abonné
  private cartSubject = new ReplaySubject<CartItem[]>(1);

  // Observable public
  cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  cartCount$: Observable<number> = this.cart$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  constructor() {
    // émettre la valeur initiale
    this.emitCart();
  }

  /** Ajouter un produit au panier */
  addToCart(product: Product, quantity: number = 1) {
    const existing = this.cart.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    this.emitCart();
  }

  /** Supprimer un produit du panier */
  removeFromCart(productId: string) {
    this.cart = this.cart.filter(i => i.product.id !== productId);
    this.emitCart();
  }

  /** Mettre à jour la quantité d’un produit */
  updateQuantity(productId: string, quantity: number) {
    const item = this.cart.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.emitCart();
    }
  }

  /** Vider le panier */
  clearCart() {
    this.cart = [];
    this.emitCart();
  }

  /** Obtenir les articles actuels (optionnel pour usage synchrone) */
  getCartItems(): CartItem[] {
    return [...this.cart];
  }

  /** Mettre à jour l’Observable */
  private emitCart() {
    this.cartSubject.next([...this.cart]);
  }
}
