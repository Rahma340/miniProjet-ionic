import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  doc,
  docData,
  addDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private firestore: Firestore) {}

  // ✅ Tous les produits
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }

  // ✅ Produit par ID
  getProductById(id: string): Observable<Product | undefined> {
    const productRef = doc(this.firestore, `products/${id}`);
    return docData(productRef, { idField: 'id' }) as Observable<Product | undefined>;
  }

  // ✅ Produits par catégorie
  getProductsByCategory(category: string): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('category', '==', category));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // ✅ Ajouter un produit
  addProduct(product: Product) {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, product);
  }

  // ✅ Supprimer un produit
  deleteProduct(id: string) {
    const productRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(productRef);
  }
}
