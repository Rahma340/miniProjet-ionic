import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  /** Récupérer un document par ID */
  async getDocumentData(collectionName: string, id: string): Promise<any | null> {
    const ref = doc(this.firestore, `${collectionName}/${id}`);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  /** Ajouter ou mettre à jour un document */
  async setDocumentData(collectionName: string, id: string, data: any) {
    const ref = doc(this.firestore, `${collectionName}/${id}`);
    await setDoc(ref, data, { merge: true });
  }
}
