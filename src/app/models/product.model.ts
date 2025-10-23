export interface Product {
  id?: string;
  name: string;
  price: number;        
  description: string;
  category: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
  stock: number;
}


