import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
  standalone : false ,
})
export class ProductDetailsPage implements OnInit {
  product?:Product;

  constructor(
    private route : ActivatedRoute,
    private productService : ProductService ,
    private cartService : CartService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ;
    if(id){
      this.productService.getProductById(id).subscribe((data) => {
          this.product = data
      })
    }
  }
    addToCart() {
    if (!this.product) return;
    this.cartService.addToCart(this.product, 1);
    alert('Produit ajouté au panier');
  }

}
