import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  collectionData,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { Order } from '../../../models/order.model';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-client-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false,
})
export class OrdersPage implements OnInit {
  orders$!: Observable<Order[]> | undefined;

  constructor(
    private firestore: Firestore,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Récupérer l'UID actuel de l'utilisateur connecté
    const uid = this.auth.getCurrentUid();
    if (!uid) return; // Aucun utilisateur connecté

    // Référence à la collection orders
    const ordersRef = collection(this.firestore, 'orders');

    // Créer la requête Firestore avec uid comme valeur primitive
    const q = query(ordersRef, where('userId', '==', uid));

    // Récupérer les données de la collection sous forme d'Observable
    this.orders$ = collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  /** Supprimer une commande */
  async deleteOrder(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer',
      message: 'Voulez-vous vraiment supprimer cette commande ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteDoc(doc(this.firestore, `orders/${id}`));
              const toast = await this.toastCtrl.create({
                message: 'Commande supprimée avec succès ✅',
                duration: 2000,
                color: 'success',
              });
              await toast.present();
            } catch (err) {
              const toast = await this.toastCtrl.create({
                message: 'Erreur lors de la suppression ❌',
                duration: 2000,
                color: 'danger',
              });
              await toast.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
