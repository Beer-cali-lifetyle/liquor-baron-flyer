import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UiToasterService } from '../../core/services/toaster.service';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { FormsModule, NgModel } from '@angular/forms';
import { SharedModule } from '../../shared/shared/shared.module';
import { AppBase } from '../../../app-base.component';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, SharedModule
  ]
})
export class ShoppingCartComponent extends AppBase implements OnInit {
  products: any = [];
  imgBaseUrl: string = environment.api.base_url;
  cartInfo: any;
  address: any;
  quantityOptions: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
  constructor(
    private ApiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private toaster: UiToasterService,
    public contextService: ContextService,
    private cdr: ChangeDetectorRef
  ) { super(); }

  async ngOnInit() {
    this.contextService.cart()?.subscribe((cartData: any) => {
      if (cartData && cartData.data) {
        this.calculateSubTotal(cartData.data);
      }
    });
      await this.getCart();
  }

  async fetchAddres() {
    await this.ApiService.fetchAddress().then((res) => {
      this.address = res
    })
  }

  async getCart() {
    await this.ApiService.getCartProducts().then(async(res) => {
      this.contextService.cart.set(res)
      this.cdr.detectChanges();
      await this.fetchProducts();
    })
  }

  async removeItemFromCart(id: any) {
    await this.ApiService.removeItemCart(id).then(async res => {
      await this.getCart();
    })
  }

  onQuantityChange(event: Event, id: string) {
    const target = event.target as HTMLSelectElement | null;
    const value = target ? target.value : '1'; // Fallback to '1' if target is null
    const newQuantity = parseInt(value, 10);
    this.updateQuantity(newQuantity, id);
  }

  async updateQuantity(quantity: number, id: string) {
    const payload = { quantity };
    await this.ApiService.updateQuantity(payload, id, true).then(async res => {
      await this.getCart();
    });
  }

  async emptyCart() {
    await this.ApiService.clearCart().then(async (res) => {
      await this.getCart()
    });
  }

  async fetchProducts() {
    this.pageSize = 2;
    this.currentPage = 1;
  
    // Get the category ID from the first product in the cart
    let cartProducts = await this.contextService.cart()?.data.map((item: any) => item.product.id) || [];
    let category = await this.contextService.cart()?.data[0]?.product?.cat_id;

    console.log(category);
  
    // Fetch products based on the category
    await this.ApiService.fetchFilteredProduct({
      perPage: this.pageSize,
      page: this.currentPage,
      categoryId: category
    }).then(res => {
      // Filter out products that already exist in the cart
      this.products = res?.data?.filter((product: any) => !cartProducts.includes(product.id));
    });
  }
  

  calculateSubTotal(cart: any) {
    let itemsTotal = 0;
    cart?.data?.map((item: any) => {
      itemsTotal += item?.quantity * item?.product?.price
    })
    return itemsTotal
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

      this.products[i].cart_details.quantity = calculateQuantity;
      this.getCart();
      if (this.products[i].cart_details.quantity === 0) {
        this.products[i].cart_details = null
      }
    });
  }

  async addToCart(event: Event, id: number, i: number) {
    event.stopPropagation();
    // this.products[i]['cart_details'] = this.products[i]?.cart_details ? !this.products[i]?.cart_details : true;
    if (this.contextService.user()) {
      const payload = {
        productId: id,
        quantity: 1
      }
      await this.ApiService.addToCart(payload).then(async res => {
        await this.getCart();
        // await this.toaster.Cart()
      })
    }
    else {
      await this.ApiService.GuestLogin().then(async (res: any) => {

        if (res?.token) {
          await this.addToCart(event, id, i);
        };
      })
    }
  }

}
