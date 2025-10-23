import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../models/CartItem';



@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];

  // Observables
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor() {}

  // Ajouter un produit au panier 
  addToCart(product: Product, quantity: number = 1) {
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    this.updateCart();
  }

  // Supprimer un produit du panier 
  removeFromCart(productId: string) {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    this.updateCart();
  }

  // Vider le panier 
  clearCart() {
    this.cart = [];
    this.updateCart();
  }

  // Mettre à jour la quantité d’un article 
  updateQuantity(productId: string, quantity: number) {
    const index = this.cart.findIndex((i) => i.product.id === productId);
    if (index !== -1) {
      this.cart[index].quantity = quantity;
      this.updateCart();
    }
  }

  // Obtenir tous les articles 
  getCartItems(): CartItem[] {
    return this.cart;
  }

  //Calculer le total d’articles 
  getTotalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  //Met à jour les observables 
  private updateCart() {
    this.cartSubject.next([...this.cart]); // met à jour les items
    this.cartCount.next(this.getTotalItems()); // met à jour le badge
  }
}
