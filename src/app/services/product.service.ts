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
  deleteDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private collectionName = 'products';

  constructor(private firestore: Firestore) {}

  /** 🔹 Obtenir tous les produits */
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, this.collectionName);
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }

  /** 🔹 Obtenir un produit par ID */
  getProductById(id: string): Observable<Product | undefined> {
    const productRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(productRef, { idField: 'id' }) as Observable<Product | undefined>;
  }

  /** 🔹 Obtenir les produits par catégorie */
  getProductsByCategory(category: string): Observable<Product[]> {
    const productsRef = collection(this.firestore, this.collectionName);
    const q = query(productsRef, where('category', '==', category));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  /** 🔹 Ajouter un produit (Admin) */
  addProduct(product: Product) {
    const productsRef = collection(this.firestore, this.collectionName);
    const newProduct = {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return addDoc(productsRef, newProduct);
  }

  /** 🔹 Mettre à jour un produit existant (Admin) */
  updateProduct(id: string, product: Partial<Product>) {
    const productRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const updateData = {
      ...product,
      updatedAt: new Date().toISOString(),
    };
    return updateDoc(productRef, updateData);
  }

  /** 🔹 Supprimer un produit (Admin) */
  deleteProduct(id: string) {
    const productRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(productRef);
  }
}
