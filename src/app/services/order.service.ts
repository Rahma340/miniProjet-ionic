import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private firestore: Firestore) {}

  // Crée la commande dans Firestore
  async createOrder(order: Order) {
    const col = collection(this.firestore, 'orders');
    const docRef = await addDoc(col, {
      ...order,
      createdAt: new Date().toISOString()
    });

    // Planifier une notification locale de confirmation (immédiate)
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Commande confirmée',
            body: `Votre commande #${docRef.id} a été enregistrée.`,
            id: Date.now()
          }
        ]
      });
    } catch (e) {
      // si plugin non disponible en web, on ignore proprement
      console.warn('Notification not available', e);
    }

    return docRef.id;
  }
}
