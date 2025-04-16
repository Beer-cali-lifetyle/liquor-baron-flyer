import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { CommonModule } from '@angular/common';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Console } from 'console';

// safe-url.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}


@Component({
  selector: 'app-order-confirmed',
  templateUrl: './order-confirmed.component.html',
  styleUrls: ['./order-confirmed.component.css'],
  standalone: true,
  imports: [SharedModule, CommonModule, SafeUrlPipe]
})
export class OrderConfirmedComponent implements OnInit {
  orders: any = [];
  imgBaseUrl: string = environment.api.base_url;
  subTotal: any;
  order_id: any;
  mapUrl: string = '';
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
      if(res?.order?.delivery_address) { this.orders['delivery_address'] = JSON.parse(res?.order?.delivery_address) } else {
        await this.fetchStores();
      }
      this.orders['items'] = JSON.parse(res?.order?.items)
      console.log(this.orders)
      let fullAddress = '';

      const addr = this.orders?.delivery_address?.address;
      if (addr.fullAddress) {
        // Case 1: already a full address
        fullAddress = addr.fullAddress;
      } else {
        // Case 2: build from parts
        const parts = [addr.address1, addr.city, addr.province, addr.postalCode];
        fullAddress = parts.filter(Boolean).join(', ');
      }
      
      const encodedAddress = encodeURIComponent(fullAddress);
      this.mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
    })
  }

  async fetchStores() {
    await this.ApiService.fetchStores().then((res) => {
      this.orders['store_detail'] = res?.data?.data.find((obj: any) => obj.id == this.orders.store);
            const encodedAddress = encodeURIComponent(this.orders?.store_detail?.head_office_address);
      this.mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

    })
  }

}

