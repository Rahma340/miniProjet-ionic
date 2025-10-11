export interface OrderItem {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date?: string;
}
