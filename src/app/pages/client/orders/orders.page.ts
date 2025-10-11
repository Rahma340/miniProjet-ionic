import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-client-orders',
  templateUrl: './orders.page.html',
  standalone : false ,
})
export class OrdersPage implements OnInit {
  orders$!: Observable<Order[]> | undefined;

  constructor(private firestore: Firestore, private auth: AuthService) {}

  ngOnInit() {
    const uid = this.auth.getCurrentUid();
    if (!uid) return;
    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userId', '==', uid));
    this.orders$ = collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }
}
