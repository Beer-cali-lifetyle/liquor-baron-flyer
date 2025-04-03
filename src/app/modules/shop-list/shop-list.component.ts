import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { UiToasterService } from '../../core/services/toaster.service';
import { environment } from '../../../environments/environment';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { AppBase } from '../../../app-base.component';
import { ContextService } from '../../core/services/context.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CartService } from '../../shared/services/cart.service';


@Component({
  selector: 'app-shop-list',
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, NgbPaginationModule, FormsModule, ReactiveFormsModule, InfiniteScrollDirective]
})
export class ShopListComponent extends AppBase implements OnInit, AfterViewInit {
  products: any = [];
  totalProducts: number = 0;
  stars = [1, 2, 3, 4, 5];
  categoryId: any = null;
  subcategoryId: any = null;
  flyerId: any = null;
  subcategoryTitle: string | null = null;
  categories: any[] = [];
  brands: any[] = [];
  selectedCategory: number | null = null;
  selectedBrand: number | null = null;
  imgBaseUrl: string = environment.api.base_url;
  constructor(
    private ApiService: ApiService,
    private cartService: CartService,
    private toaster: UiToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public contextService: ContextService,
    private fb: FormBuilder,
  ) { super() }

  async ngOnInit() {
    this.form = this.fb.group({
      selectedCategory: [''],
      selectedBrand: ['']
    })
    Promise.all([
      this.fetchCategories(),
      // this.fetchBrands()
    ])
    this.route.queryParams.subscribe(async (params) => {
      this.categoryId = params['categoryId'] ? parseInt(params['categoryId']) : null;
      this.subcategoryId = params['subcategoryId'] ? parseInt(params['subcategoryId']) : null;
      this.flyerId = params['flyerId'] ? parseInt(params['flyerId']) : null;
      this.subcategoryTitle = params['title'] || null;

      this.products = []; // Clear previous products before fetching new ones
      const payload: any = { perPage: this.pageSize, page: this.currentPage };

      if (this.categoryId) {
        console.log('Category ID:', this.categoryId);
        payload.categoryId = this.categoryId;
      } else if (this.subcategoryId) {
        console.log('Subcategory ID:', this.subcategoryId);
        payload.subcategoryId = this.subcategoryId;
      } else if (this.flyerId) {
        console.log('Flyer ID:', this.flyerId);
        payload.flyername = this.flyerId;
      }

      if (Object.keys(payload).length > 2) {
        await this.fetchproductsWithFilter(payload).then(async () => {
          await this.getCart();
        });
      } else {
        await this.fetchRandomProducts(payload);
      }
    });
    this.cartService.cartUpdated$.subscribe(() => {
      this.getCart();
    });
  }

  async fetchRandomProducts(data: any) {
    await this.ApiService.fetcHlatestProducts(data).then(async (res) => {
      this.products = res?.data || [];
      this.totalProducts = res?.total;
      console.log(this.products);
      await this.getCart();
      this.subcategoryTitle = 'Browse Everything in Liquor Baron';
      this.selectedCategory = null;
      this.selectedBrand = null;
      this.form.patchValue({
        selectedCategory: null,
        selectedBrand: null
      })
    });
  }

  async ngAfterViewInit() {
    await this.cdr.detectChanges();
  }

  async fetchCategories() {
    await this.ApiService.getCategories().then((res) => {
      this.categories = res?.categories;
      this.cdr.detectChanges()
    })
  }

  async fetchBrands() {
    await this.ApiService.getBrands().then((res) => {
      this.brands = res?.data;
    })
  }

  onCategoryChange(categoryId: number, name: string) {
    if ((this.selectedCategory === categoryId) && !this.selectedBrand) {
      this.route.queryParams.subscribe(async (params) => {
        this.categoryId = params['categoryId'] ? parseInt(params['categoryId']) : null;
        this.subcategoryId = params['subcategoryId'] ? parseInt(params['subcategoryId']) : null;
        this.flyerId = params['flyerId'] ? parseInt(params['flyerId']) : null;
        this.subcategoryTitle = params['title'] || null;

        this.products = [];
        const payload: any = { perPage: this.pageSize, page: this.currentPage };

        if (this.categoryId) {
          console.log('Category ID:', this.categoryId);
          payload.categoryId = this.categoryId;
        } else if (this.subcategoryId) {
          console.log('Subcategory ID:', this.subcategoryId);
          payload.subcategoryId = this.subcategoryId;
        } else if (this.flyerId) {
          console.log('Flyer ID:', this.flyerId);
          payload.flyername = this.flyerId;
        }

        if (Object.keys(payload).length > 2) {
          await this.fetchproductsWithFilter(payload)
        } else {
          await this.fetchRandomProducts(payload);
        }
      });
      this.selectedCategory = null;
      return
    }
    this.selectedCategory = categoryId
    this.selectedCategory = categoryId;
    const payload: any = { categoryId: this.selectedCategory, perPage: this.pageSize, page: this.currentPage };
    if (this.form.value.selectedBrand) {
      payload['brand'] = this.form.value.selectedBrand;
    }
    // if (this.selectedCategory === categoryId) {
    //   delete payload.categoryId;
    // }
    this.fetchproductsWithFilter(payload).then(() => {
      this.selectedCategory = null;
    });
    this.subcategoryTitle = name;
  }

  onBrandChange(brandId: number, name: string) {
    if ((this.selectedBrand === brandId) && !this.selectedCategory) {
      this.route.queryParams.subscribe(async (params) => {
        this.categoryId = params['categoryId'] ? parseInt(params['categoryId']) : null;
        this.subcategoryId = params['subcategoryId'] ? parseInt(params['subcategoryId']) : null;
        this.flyerId = params['flyerId'] ? parseInt(params['flyerId']) : null;
        this.subcategoryTitle = params['title'] || null;

        this.products = [];
        const payload: any = { perPage: this.pageSize, page: this.currentPage };

        if (this.categoryId) {
          console.log('Category ID:', this.categoryId);
          payload.categoryId = this.categoryId;
        } else if (this.subcategoryId) {
          console.log('Subcategory ID:', this.subcategoryId);
          payload.subcategoryId = this.subcategoryId;
        } else if (this.flyerId) {
          console.log('Flyer ID:', this.flyerId);
          payload.flyername = this.flyerId;
        }

        if (Object.keys(payload).length > 2) {
          await this.fetchproductsWithFilter(payload).then(async () => {
            await this.getCart();
          });
        } else {
          await this.fetchRandomProducts(payload)
        }
      });
      this.selectedBrand = null;
      return
    }
    this.selectedBrand = brandId;
    const payload: any = { brand: this.selectedBrand, perPage: this.pageSize, page: this.currentPage };
    this.selectedBrand = brandId
    if (this.form.value.selectedCategory) {
      payload['categoryId'] = this.form.value.selectedCategory;
    }
    // if (this.selectedBrand === brandId) {
    //   delete payload.brand;
    // }
    this.fetchproductsWithFilter(payload);
    this.subcategoryTitle = name;
  }

  async addToCart(event: Event, id: number, i: number) {
    event.stopPropagation();
    this.products[i]['cart_details'] = this.products[i]?.cart_details ? !this.products[i]?.cart_details : true;
    const payload = {
      productId: id,
      quantity: 1
    }
    if (this.contextService.user()) {
      await this.ApiService.addToCart(payload).then(async res => {
        await this.getCart();
      })
    } else {
      await this.ApiService.GuestLogin().then(() => {
        this.addToCart(event, id, i)
      })
    }
  }

  async getCart() {
    if (this.contextService.user()) {
      await this.ApiService.getCartProducts().then((res) => {
        this.products.forEach((product: any) => product['cart_details'] = null);
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
        this.contextService.cart.set(res)
      })
    }
  }

  async addToWishlist(id: any, i: any) {
    if (this.contextService.user()) {
      await this.ApiService.addToWishlist({ productId: id }).then(async (res) => {
        this.products[i]['is_whishlisted'] = true
      })
    } else {
      await this.ApiService.GuestLogin().then(() => {
        this.addToWishlist(id, i)
      })
    }
  }

  // async removeFromWishlist() {
  //   await this.ApiService.removeFromWishlist(

  //   ).then(async res => {
  //     await this.fetchWishlist();
  //   })
  // }

  async fetchproductsWithFilter(data: any) {
    await this.ApiService.fetchFilteredProduct(data).then((res) => {
      this.products = res?.data
      this.totalProducts = res?.total;
    })
  }

  async onPageChange(pagenumber: any) {
    this.currentPage = pagenumber;
    debugger;
    if (!(this.categoryId || this.subcategoryId || this.flyerId) && !(this.selectedBrand || this.selectedCategory)) {
      return await this.ApiService.fetcHlatestProducts({ perPage: this.pageSize, page: this.currentPage }).then((res) => {
        this.products = [...this.products, ...res?.data]
      })
    } else {
      let payload: any = { perPage: this.pageSize, page: this.currentPage }
      if (this.selectedBrand) {
        payload['brand'] = this.selectedBrand;
      }
      if (this.selectedCategory) {
        payload['categoryId'] = this.selectedCategory;
        return await this.fetchproductsWithFilter(payload)
      }
      if (this.subcategoryId) {
        payload['subcategoryId'] = this.subcategoryId;
        return await this.fetchproductsWithFilter(payload)
      }
      if (this.categoryId && !this.selectedBrand) {
        payload['categoryId'] = this.categoryId;
        return await this.fetchproductsWithFilter(payload)
      }
      if (this.flyerId) {
        payload['flyername'] = this.flyerId;
        return await this.fetchproductsWithFilter(payload)
      }
    }
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

  // onScroll() {
  //   this.currentPage++;
  //   this.fetchMoreProducts();
  // }

  // async fetchMoreProducts() {
  //   if (this.products.length < this.totalProducts) {
  //     let payload: any = { perPage: this.pageSize, page: this.currentPage };
  //     if (this.selectedBrand) {
  //       payload['brand'] = this.selectedBrand;
  //     }
  //     if (this.selectedCategory) {
  //       payload['categoryId'] = this.selectedCategory;
  //     }
  //     if (this.subcategoryId) {
  //       payload['subcategoryId'] = this.subcategoryId;
  //     }
  //     if (this.categoryId && !this.selectedBrand) {
  //       payload['categoryId'] = this.categoryId;
  //     }
  //     if (this.flyerId) {
  //       payload['flyername'] = this.flyerId;
  //     }

  //     await this.fetchproductsWithFilter(payload)
  //   }
  // }


}



