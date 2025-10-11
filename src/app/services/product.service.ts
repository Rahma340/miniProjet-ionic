import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private firestore: Firestore) {}

  // Récupérer tous les produits
 getProducts(): Observable<Product[]> {
  const productsRef = collection(this.firestore, 'products');
  return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
}

getProductById(id: string): Observable<Product | undefined> {
  const productRef = doc(this.firestore, `products/${id}`);
  return docData(productRef, { idField: 'id' }) as Observable<Product | undefined>;
}


  addProduct(product: Product) {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, product); // pas besoin de type générique ici
  }

  // Supprimer un produit par id
  deleteProduct(id: string) {
    const productRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(productRef);
  }
}
