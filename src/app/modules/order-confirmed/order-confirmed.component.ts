import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { CommonModule } from '@angular/common';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-confirmed',
  templateUrl: './order-confirmed.component.html',
  styleUrls: ['./order-confirmed.component.css'],
  standalone: true,
  imports: [SharedModule, CommonModule]
})
export class OrderConfirmedComponent implements OnInit {
  orders: any = [];
  imgBaseUrl: string = environment.api.base_url;
  subTotal: any;
  order_id: any;
  constructor(
    public contextService: ContextService,
    private ApiService: ApiService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.order_id = params.get('order_id');
      console.log('order_id parameter:', this.order_id);
    });
    await this.fetchOrders();
  }

  calculateSubTotal(cart: any) {
    let itemsTotal = 0;
    cart?.data?.map((item: any) => {
      itemsTotal += item?.quantity * item?.product?.price
    })
    this.subTotal = itemsTotal;
    return itemsTotal
  }

  async fetchOrders() {
    this.orders = [];
    await this.ApiService.fetchParticularOrder(this.order_id).then(async (res) => {
      this.orders = res?.order;
      if(res?.order?.delivery_address) { this.orders['delivery_address'] = JSON.parse(res?.order?.delivery_address) }
    })
  }

}
