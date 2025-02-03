import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { Console } from 'console';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ContextService } from '../../../core/services/context.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class WishlistComponent implements OnInit {
  wishLstItems: any;
  imgBaseUrl: string = environment.api.base_url;
  constructor(
    private ApiService: ApiService,
    private contextService: ContextService
  ) { }


  async ngOnInit() {
    await this.fetchWishList();
    await this.getCart();
  }

  async fetchWishList() {
    await this.ApiService.fetchWishList().then((res) => {
      this.wishLstItems = res
      console.log(this.wishLstItems)
    })
  }

  async addToCart(e: any, id: any) {
    e.stopPropagation();
    const payload = {
      productId: id,
      quantity: 1
    }
    await this.ApiService.addToCart(payload).then(async (res: any) => {
      await this.getCart();
      console.log(this.wishLstItems.data)
    })
  }

  async getCart() {
    if (this.contextService.user()) {
      await this.ApiService.getCartProducts().then((res) => {
        res?.data.forEach((dataItem: any) => {
          const productIndex = this.wishLstItems.data.findIndex((prod: any) => prod?.product?.id === dataItem.product_id);
          if (productIndex !== -1) {
            this.wishLstItems.data[productIndex].product['cart_details'] = {
              id: dataItem?.id,
              product_id: dataItem?.product_id,
              quantity: dataItem?.quantity,
            };
          }
        });
        
        console.log(this.wishLstItems.data)
        this.contextService.cart.set(res)
      })
    }
  }


  async addToWishlist(id: any, i: any) {
    await this.ApiService.addToWishlist({ productId: id }).then(async (res) => {
      this.wishLstItems[i]['is_whishlisted'] = true
    })
  }

  decrementProductCard(id: any, quantity: any, i: any, event: any) {
    event.stopPropagation();
    this.updateQuantityProductCard(id, quantity, i, 'dec');
  }

  incrementProductCard(id: any, quantity: any, i: any, event: any) {
    event.stopPropagation();
    this.updateQuantityProductCard(id, quantity, i, 'inc');
  }

  async updateQuantityProductCard(id: any, quantity: any, i: any, value: 'inc' | 'dec') {
    const calculateQuantity = value === 'inc' ? quantity + 1 : quantity - 1;
    const payload = {
      quantity: calculateQuantity,
    };
    await this.ApiService.updateQuantity(payload, id).then(async (res) => {
      
      this.wishLstItems.data[i].product.cart_details.quantity = calculateQuantity;
      this.getCart();
      if (this.wishLstItems?.data[i]?.product?.cart_details.quantity === 0) {
        this.wishLstItems.data[i].product.cart_details = null
      }
    });
  }

}
