import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false

})
export class HomePage implements OnInit {

  products$! : Observable<Product[]>  ;


  constructor(private productService : ProductService , private router : Router) { }

  ngOnInit() {
      this.products$ = this.productService.getProducts();
  }

  goToDetails(product : Product){
    this.router.navigate(['/client/product-details' , product.id]);
  }

}
