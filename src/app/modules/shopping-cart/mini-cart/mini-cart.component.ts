import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ContextService } from '../../../core/services/context.service';
import { environment } from '../../../../environments/environment';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.css'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule
  ]
})
export class MiniCartComponent implements OnInit {
  imgBaseUrl: string = environment.api.base_url;
  cartInfo: any;
  relatedProducts: any = [];
  quantityOptions: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
  constructor(
    private ApiService: ApiService,
    public contextService: ContextService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.contextService.cart()?.subscribe((cartData: any) => {
      if (cartData && cartData.data) {
        this.calculateSubTotal(cartData.data);
      }
    });
    await Promise.all([this.getCart(), this.fetchRelatedProducts()]);
  }

  async getCart() {
    await this.ApiService.getCartProducts().then((res) => {
      this.contextService.cart.set(res)
      this.cdr.detectChanges();
    })
  }

  increment(quantity: number, id: string) {
    quantity++;
    this.updateQuantity(quantity, id);

  }

  decrement(quantity: number, id: string) {
    if (quantity > 1) {
      quantity--;
      this.updateQuantity(quantity, id);
    }
  }

  async removeItemFromCart(id: any) {
    await this.ApiService.removeItemCart(id).then(async res => {
      await this.getCart();
    })
  }
  
  async updateQuantity(quantity: number, id: string) {
    const payload = { quantity };
    await this.ApiService.updateQuantity(payload, id).then(async res => {
      await this.getCart();
    });
  }

  async emptyCart() {
    await this.ApiService.clearCart().then(async (res) => {
      await this.getCart()
    });
  }

  calculateSubTotal(cart: any) {
    let itemsTotal = 0;
    cart?.data?.map((item: any) => {
      itemsTotal += item?.quantity * item?.product?.price
    })
    return itemsTotal
  }

  async fetchRelatedProducts() {
    await this.ApiService.fetchFilteredProduct({ categoryId: this.contextService.cart()?.data[0].product?.cat_id, perPage: 2, page: 1 }).then((res) => {
      this.relatedProducts = res?.data;
    })
  }

    async addToCartRelated(event: Event, id: number, i: number) {
      event.stopPropagation();
      this.relatedProducts[i].cart_details = this.relatedProducts[i].cart_details !== undefined ? !this.relatedProducts[i].addcart_detailsedTocart : true;
        const payload = {
          productId: id,
          quantity: 1
        }
        await this.ApiService.addToCart(payload).then(async res => {
          await this.getCart();
        })
      }

}
