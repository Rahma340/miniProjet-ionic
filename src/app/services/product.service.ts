import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  deleteDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private collectionName = 'products';

  private productsByCategorySubject = new BehaviorSubject<{ [key: string]: Product[] }>({});
  productsByCategory$ = this.productsByCategorySubject.asObservable();

  constructor(private firestore: Firestore) {
    this.loadAllProducts();
  }

  /** Charger tous les produits depuis Firestore et les grouper par catégorie */
  private loadAllProducts() {
    const productsRef = collection(this.firestore, this.collectionName);
    collectionData(productsRef, { idField: 'id' }).subscribe((products: any[]) => {
      const grouped: { [key: string]: Product[] } = {};
      products.forEach(p => {
        const prod: Product = {
          id: p.id,
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? 0,
          stock: p.stock ?? 0,
          category: p.category || '',
          imageUrl: p.imageUrl || '',
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        };
        if (!grouped[prod.category]) grouped[prod.category] = [];
        grouped[prod.category].push(prod);
      });
      this.productsByCategorySubject.next(grouped);
    });
  }

  /** Obtenir tous les produits */
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, this.collectionName);
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }

  /** Obtenir un produit par ID */
  getProductById(id: string): Observable<Product | undefined> {
    const productRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(productRef, { idField: 'id' }) as Observable<Product | undefined>;
  }

  /** Ajouter un produit */
  async addProduct(product: Product) {
    const productsRef = collection(this.firestore, this.collectionName);

    // Création d'un objet Product complet
    const newProduct: Product = {
      ...product,
      id: '', // temporaire, sera remplacé par docRef.id
      createdAt: new Date(),
      updatedAt: new Date(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || ''
    };

    // Ajouter dans Firestore (dates converties en string)
    const docRef = await addDoc(productsRef, {
      ...newProduct,
      createdAt: newProduct.createdAt?.toString(),
      updatedAt: newProduct.updatedAt?.toString()
    });

    // Mettre à jour l'id et le BehaviorSubject
    newProduct.id = docRef.id;
    const current = this.productsByCategorySubject.value;
    const category = newProduct.category;
    const updatedCategory: Product[] = current[category]
      ? [...current[category], newProduct]
      : [newProduct];
    this.productsByCategorySubject.next({ ...current, [category]: updatedCategory });

    return docRef;
  }

  /** Mettre à jour un produit */
  async updateProduct(id: string, product: Partial<Product>) {
    const productRef = doc(this.firestore, `${this.collectionName}/${id}`);

    // Mettre à jour Firestore (conserver updatedAt)
    const updateData = {
      ...product,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(productRef, updateData);

    // Mettre à jour BehaviorSubject local
    const current = this.productsByCategorySubject.value;

    // Retirer le produit de sa catégorie actuelle
    Object.keys(current).forEach(cat => {
      const index = current[cat].findIndex(p => p.id === id);
      if (index !== -1) current[cat].splice(index, 1);
    });

    // Ajouter à la nouvelle catégorie
    if (product.category) {
      const newCategory = product.category;
      const updatedProduct: Product = {
        id,
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        category: product.category,
        imageUrl: product.imageUrl || '',
        createdAt: product.createdAt instanceof Date ? product.createdAt : new Date(),
        updatedAt: new Date()
      };
      const updatedCategory: Product[] = current[newCategory]
        ? [...current[newCategory], updatedProduct]
        : [updatedProduct];
      this.productsByCategorySubject.next({ ...current, [newCategory]: updatedCategory });
    } else {
      this.productsByCategorySubject.next({ ...current });
    }
  }

  /** Supprimer un produit */
  async deleteProduct(id: string) {
    const productRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(productRef);

    // Mettre à jour le BehaviorSubject local
    const current = this.productsByCategorySubject.value;
    Object.keys(current).forEach(cat => {
      current[cat] = current[cat].filter(p => p.id !== id);
    });
    this.productsByCategorySubject.next({ ...current });
  }
}
