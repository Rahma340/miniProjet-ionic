import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart.asObservable();

  constructor() {}

  addToCart(product: Product, quantity = 1) {
    const items = this._cart.getValue();
    const index = items.findIndex(i => i.product.id === product.id);
    if (index > -1) {
      items[index].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this._cart.next(items);
  }

  removeFromCart(productId: string) {
    const items = this._cart.getValue().filter(i => i.product.id !== productId);
    this._cart.next(items);
  }

  clearCart() {
    this._cart.next([]);
  }

  getTotal(): number {
    return this._cart.getValue().reduce(
      (sum, i) => sum + parseFloat(i.product.price) * i.quantity, 
      0
    );
  }
}
