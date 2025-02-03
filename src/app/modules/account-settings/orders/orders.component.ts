import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { ContextService } from '../../../core/services/context.service';
import { RouterModule } from '@angular/router';
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
  currentOrder: any;
  imgBaseUrl: string = environment.api.base_url;
  constructor(
    private ApiService: ApiService,
    private modalService: NgbModal,
    private contextService: ContextService
  ) { }

  async ngOnInit() {
    await this.fetchOrders();
  }

  async fetchOrders() {
    this.orders = [];
    await this.ApiService.fetchOrders(this.contextService.user()?.id).then((res) => {
      this.orders = res
    })
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

}
