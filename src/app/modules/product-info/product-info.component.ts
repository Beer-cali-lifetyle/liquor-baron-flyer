import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { AppBase } from '../../../app-base.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UiToasterService } from '../../core/services/toaster.service';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, FormsModule]
})
export class ProductInfoComponent extends AppBase implements OnInit {
  stars = [1, 2, 3, 4, 5];
  ratings = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];
  productInfo: any;
  cartInfo: any;
  quantity: any = 'Add';
  wishlist: any;
  imgBaseUrl: string = environment.api.base_url;
  mainProductImage: string = '';
  relatedProducts: any = [];
  averageRating: any;
  totalRatings: any;
  constructor(private ApiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toaster: UiToasterService,
    public contextService: ContextService,
    private fb: FormBuilder,
    private modal: NgbModal
  ) {
    super();
    this.checkMode(this.activatedRoute.snapshot.params);
  }

  async ngOnInit() {
    this.form = this.fb.group({
      rating: [null, Validators.required],
      review: ['', Validators.required],
      headline: ['', Validators.required],
      name: [''],
      email: [''],
      media: [''],
      terms: [false, Validators.requiredTrue],
    });
    await this.ApiService.fetchProduct(this.id).then(async (res) => {
      this.productInfo = res;
      this.mainProductImage = res?.product?.product_image;
      let imgObj = { product_sub_image: res?.product?.product_image }
      this.productInfo?.images.unshift(imgObj);
      this.productInfo.reviews.forEach((review: any) => {
        const star = review.rating;
        const ratingItem = this.ratings.find(r => r.stars === star);
        if (ratingItem) {
          ratingItem.count += 1;
        }
      });
      this.totalRatings = this.productInfo?.reviews.reduce((sum: any, item: any) => sum + item.rating, 0);
      this.averageRating = this.totalRatings / this.productInfo?.reviews.length;
      console.log(this.productInfo)
      Promise.all([
         this.getCart(),
         this.fetchWishlist(),
         this.fetchRelatedProducts(),
      ])
    })
  }

  increment() {
    
    if (this.quantity === 'Add') { this.quantity = 0 }
    this.quantity++;
    if (this.cartInfo?.id) {
      this.updateQuantity();
    }
  }

  add12() {
    this.quantity = this.quantity === 'Add' ? 0 + 12 : this.quantity + 12;
    if (this.cartInfo?.id) {
      this.updateQuantity();
    }
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
      if (this.cartInfo?.id) {
        this.updateQuantity();
      }
    } else {
      if (this.quantity === 1) {
        this.quantity = 'Add';
        this.removeItemFromCart();
      }
    }
  }

  async removeItemFromCart() {
    await this.ApiService.removeItemCart(this.cartInfo?.id).then(async res => {
      await this.getCart();
    })
  }

  async addToCart(event: Event, id: number, i: number, quantity?: number) {
    event.stopPropagation();
    // this.relatedProducts[i].addedTocart = this.relatedProducts[i].addedTocart !== undefined ? !this.relatedProducts[i].addedTocart : true;
    if (this.contextService.user()) {
      const payload = {
        productId: id,
        quantity: quantity ? quantity : ((this.quantity === 0 || this.quantity === 'Add') ? 1 : this.quantity)
      }
      await this.ApiService.addToCart(payload).then(async res => {
        await this.getCart();
        // await this.toaster.Success('Added to cart successfully')
      })
    }
    else {
      await this.ApiService.GuestLogin().then(async (res: any) => {
        if (res?.token) {
         await this.addToCart(event, id, i)
        };
      })
    }
  }
  
  async addToCartRelated(event: Event, id: number, i: number) {
    event.stopPropagation();
    this.relatedProducts[i].cart_details = this.relatedProducts[i].cart_details !== undefined ? !this.relatedProducts[i].addcart_detailsedTocart : true;
    if (this.contextService.user()) {
      const payload = {
        productId: id,
        quantity: 1
      }
      await this.ApiService.addToCart(payload).then(async res => {
        await this.getCart();
        // await this.toaster.Success('Added to cart successfully')
      })
    }
    else {
      this.router.navigate(['/auth/sign-in'])
    }
  }

  selectImageToShow(e: any) {
    this.mainProductImage = e;
  }

  async getCart() {
    if (this.contextService.user()) {
      await this.ApiService.getCartProducts().then((res) => {
        this.contextService.cart.set(res);
        res?.data.forEach((dataItem: any) => {
          const productIndex = this.relatedProducts.findIndex((prod: any) => prod.id === dataItem.product_id);
          if (productIndex !== -1) {
            this.relatedProducts[productIndex]['cart_details'] = {
              id: dataItem?.id,
              product_id: dataItem?.product_id,
              quantity: dataItem?.quantity,
            };
          }
          if (dataItem?.product?.id === this.productInfo?.product?.id) {
            this.cartInfo = dataItem
            this.quantity = dataItem?.quantity;
          }
        });
      })
    }
  }

  async updateQuantity() {
    const payload = {
      quantity: this.quantity
    }
    await this.ApiService.updateQuantity(payload, this.cartInfo?.id).then(async res => {
      await this.getCart();
      await this.toaster.Cart()
    })
  }

  async addToWishlist(id: any) {
    if (this.contextService.user()) {
      const payload = {
        productId: id
      }
      await this.ApiService.addToWishlist(payload).then(async (res) => {
        await this.fetchWishlist();
      })
    } else {
      await this.ApiService.GuestLogin().then(async (res: any) => {
        if (res?.token) {
         await this.addToWishlist(id);
        };
      })
    }
  }

  async fetchWishlist() {
    if (this.contextService.user()) {
      this.wishlist = null;
      await this.ApiService.fetchWishlist().then(res => {
        res?.data?.map((item: any) => {
          if (item?.product?.id === this.productInfo?.product?.id) {
            this.wishlist = item;
          }
        })
      })
    }
  }

  async fetchRelatedProducts() {
    await this.ApiService.fetchFilteredProduct({ categoryId: this.productInfo?.product?.cat_id, perPage: 3, page: 1 }).then((res) => {
      this.relatedProducts = res?.data;
    })
  }

  async selectRelated(id: any) {
    await this.ApiService.fetchProduct(id).then((res) => {
      this.productInfo = res;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to the top
    });
  }

  async removeFromWishlist() {
    await this.ApiService.removeFromWishlist(this.wishlist?.id).then(async res => {
      await this.fetchWishlist();
    })
  }

  async openReviewForm(component: any) {
    if (this.contextService.user()) {
      await this.modal.open(component, {
        size: 'lg',
        animation: true
      });
    }
    else {
      this.router.navigate(['/auth/sign-in'])
    }
  }


  setRating(rating: number) {
    this.form.patchValue({ rating });
  }

  async onReviewSubmit() {
    if (this.form.valid) {
      const value = {
        user_id: this.contextService.user()?.id,
        product_id: this.productInfo?.product?.id,
        review: this.form.value.headline,
        rating: this.form.value.rating,
        comment: this.form.value.review
      }
      await this.ApiService.postReview(value);
      this.toaster.Success('Review Submitted Successfully');
      await this.ApiService.fetchProduct(this.id).then(async (res) => {
        this.productInfo = res
        this.mainProductImage = res?.product?.product_image;
        this.totalRatings = this.productInfo?.reviews.reduce((sum: any, item: any) => sum + item.rating, 0);
        this.averageRating = this.totalRatings / this.productInfo?.reviews.length;
        this.productInfo.reviews.forEach((review: any) => {
          const star = review.rating;
          const ratingItem = this.ratings.find(r => r.stars === star);
          if (ratingItem) {
            ratingItem.count += 1;
          }
        });
      });
      this.closeModal();

    } else {
      this.validateForm();
    }
  }

  closeModal() {
    this.form.reset();
    this.modal.dismissAll();
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
      this.relatedProducts[i].cart_details.quantity = calculateQuantity;
      this.getCart();
      if (this.relatedProducts[i].cart_details.quantity === 0) {
        this.relatedProducts[i].cart_details = null
      }
    });
  }

}
