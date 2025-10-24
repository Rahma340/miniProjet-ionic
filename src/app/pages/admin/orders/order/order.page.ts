import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-orders-admin',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: false
})
export class OrdersAdminPage implements OnInit {
  orders$!: Observable<any[]>;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    const ordersRef = collection(this.firestore, 'orders');
    this.orders$ = collectionData(ordersRef, { idField: 'id' }).pipe(
      switchMap((orders: any[]) => {
        const users = orders.map(async (o) => {
          const userSnap = await getDoc(doc(this.firestore, `users/${o.userId}`));
          return { ...o, userName: userSnap.data()?.['name'] || 'Utilisateur inconnu' };
        });
        return from(Promise.all(users));
      })
    );
  }

  formatDate(date: any) {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return jsDate.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
