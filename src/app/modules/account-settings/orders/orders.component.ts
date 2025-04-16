import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { ContextService } from '../../../core/services/context.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  standalone: true,
  imports: [
    CommonModule, RouterModule
  ]
})
export class OrdersComponent implements OnInit {
  orders: any = [];
  completed_orders: any = [];
  currentOrder: any;
  imgBaseUrl: string = environment.api.base_url;
  constructor(
    private ApiService: ApiService,
    private modalService: NgbModal,
    private contextService: ContextService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.fetchOrders();
  }

  async fetchOrders() {
    this.orders = [];
    this.completed_orders = [];

    await this.ApiService.fetchOrders(this.contextService.user()?.id).then((res) => {
      // Separate completed orders
      this.completed_orders = res?.filter((order: any) => order.status === 'completed');
      this.orders = res?.filter((order: any) => order.status !== 'completed');
    });
  }


  getOrderType(ordertype: any) {
    switch (ordertype) {
      case 'local':
        return 'Local Delivery'
        break;
      case 'store':
        return 'Store Pickup'
        break;
      case 'shipping':
        return 'Shipping'
        break;
      default:
        return null
        break;
    }
  }

  openModal(content: any, order: any) {
    this.currentOrder = order;
    const modalRef: NgbModalRef = this.modalService.open(content, {
      centered: true,
      backdrop: true,
      keyboard: true,
      size: 'lg'
    });

  }

  closeModal() {
    this.modalService.dismissAll()
  }


  async reorder(order: any, event: any) {
    event.stopPropagation();
  
    // Add all items to the cart
    await Promise.all(order?.items.map(async (item: any) => {
      const payload = {
        productId: item?.product_id,
        quantity: item?.quantity
      };
      return this.ApiService.addToCartWithoutPopup(payload);
    }));
  
    // Refresh the cart
    await this.getCart();
  
    // Redirect to /cart
    this.router.navigate(['/cart']);
  }
  

  async getCart() {
    if (this.contextService.user()) {
      await this.ApiService.getCartProducts().then((res) => {
        this.contextService.cart.set(res)
      })
    }
  }

}
