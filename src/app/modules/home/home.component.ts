import { Component, AfterViewInit, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef, ElementRef, viewChild, ViewChild } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SharedModule } from '../../shared/shared/shared.module';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ContextService } from '../../core/services/context.service';
import { AppBase } from '../../../app-base.component';
import { UiToasterService } from '../../core/services/toaster.service';
import { MiniCartComponent } from "../shopping-cart/mini-cart/mini-cart.component";
declare var bootstrap: any;

@Component({
  imports: [
    CommonModule,
    SharedModule,
    MiniCartComponent
  ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
})
export class HomeComponent extends AppBase implements OnInit, AfterViewInit {
  @ViewChild('homepageCarousel', { static: false }) carousel!: ElementRef;
  categories: any;
  subCategories: any[] = [];
  products: any = [];
  quantity: number = 1;
  cartInfo: any;
  currentYear: number = new Date().getFullYear();
  imgBaseUrl: string = environment.api.base_url;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private ApiService: ApiService,
    private router: Router,
    private contextService: ContextService,
    private toaster: UiToasterService,
    private cdr: ChangeDetectorRef) {
    super();
  }

  async ngOnInit() {
    await this.fetchCategories();
    await this.fetchProducts();
    await this.getCart();
  }

  ngAfterViewInit(): void {
    const carouselElement = this.carousel.nativeElement;
    new bootstrap.Carousel(carouselElement, {
      interval: 5000,
      ride: 'carousel',
      pause: 'false'
    });
  }

  redirectToShopList(type: string, id: number, title: string) {
    if (type === 'category') {
      this.router.navigate(['/shop'], { queryParams: { categoryId: id, title: title } });
    } else if (type === 'subcategory') {
      this.router.navigate(['/shop'], { queryParams: { subcategoryId: id, title: title } });
    }
  }

  get hasCategories(): boolean {
    return this.categories?.length > 0;
  }


  async fetchCategories() {
    await this.ApiService.getCategories().then(async (res) => {
      this.subCategories = res?.categories[0]?.subcategories;
    })
  }

  async fetchProducts() {
    this.pageSize = 8;
    this.currentPage = 1;
    await this.ApiService.fetcHlatestProducts({ perPage: this.pageSize, page: this.currentPage }).then(res => {
      this.products = res?.data;
    })
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

  async getCart() {
    if (this.contextService.user()) {
      await this.ApiService.getCartProducts().then((res) => {
        res?.data.forEach((dataItem: any) => {
          const productIndex = this.products.findIndex((prod: any) => prod.id === dataItem.product_id);
          
          if (productIndex !== -1) {
            this.products[productIndex]['cart_details'] = {
              id: dataItem?.id,
              product_id: dataItem?.product_id,
              quantity: dataItem?.quantity,
            };
          }
          console.log(this.products)
        });
        this.contextService.cart.set(res);
        console.log(this.contextService.cart()?.data)
      })
    }
  }

  async addToWishlist(id: any, i: number) {
    if (this.contextService.user()) {
      const payload = {
        productId: id
      }
      this.products[i]['wishlisted'] = true;
      await this.ApiService.addToWishlist(payload).then(async (res) => {
        // await this.fetchWishlist();
      })
    } else {
      this.router.navigate(['/auth/sign-in'])
    }
  }


  async removFromWishlist(id: any, i: number) {
    if (this.contextService.user()) {
      const payload = {
        productId: id
      }
      this.products[i]['wishlisted'] = false;
      await this.ApiService.removeFromWishlist(payload).then(async (res) => {
        // await this.fetchWishlist();
      })
    } else {
      this.router.navigate(['/auth/sign-in'])
    }
  }


  async loadMore() {
    let page = this.pageSize + 12
    await this.ApiService.fetcHlatestProducts({ perPage: page, page: this.currentPage }).then(res => {
      this.products = res?.data;
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
      
      this.products[i].cart_details.quantity = calculateQuantity;
      this.getCart();
      if (this.products[i].cart_details.quantity === 0) {
        this.products[i].cart_details = null
      }
    });
  }

}
