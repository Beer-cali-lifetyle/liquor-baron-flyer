import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UiToasterService } from '../../core/services/toaster.service';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { FormsModule, NgModel } from '@angular/forms';
import { SharedModule } from '../../shared/shared/shared.module';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, SharedModule
  ]
})
export class ShoppingCartComponent implements OnInit {
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
  ) { }

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
    await this.ApiService.getCartProducts().then((res) => {
      this.contextService.cart.set(res)
      this.cdr.detectChanges();
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

  calculateSubTotal(cart: any) {
    let itemsTotal = 0;
    cart?.data?.map((item: any) => {
      itemsTotal += item?.quantity * item?.product?.price
    })
    return itemsTotal
  }

}
