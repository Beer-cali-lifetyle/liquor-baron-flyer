import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpServie } from './http.service';
import { UiToasterService } from '../../core/services/toaster.service';
import { ContextService } from '../../core/services/context.service';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private isBrowser: boolean;

  constructor(
    private httpRequest: HttpServie,
    private toaster: UiToasterService,
    private context: ContextService,
    @Inject(PLATFORM_ID) private platformId: Object  // Inject PLATFORM_ID for SSR checks
  ) {
    this.isBrowser = isPlatformBrowser(platformId);  // Detect if it's a browser or server
  }

  async GuestSignIn() {
    return await this.httpRequest.POST(`/createguestuser`);
  }

  async GuestLogin() {
    try {
      const res = await this.GuestSignIn();

      await this.context.user.set(res?.user);
      debugger;
      console.log(res);
      localStorage.setItem('access_token', res?.token);
      localStorage.setItem('user_id', res?.user?.id);
      localStorage.setItem('user', JSON.stringify(res?.user));
      return res;
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  }

  async SignIn(data: any) {
    return await this.httpRequest.POST(`/login`, data);
  }

  async SignUp(data: any) {
    return await this.httpRequest.POST(`/createusers`, data);
  }

  async getUserDetails(id: string) {
    return await this.httpRequest.GET(`/user/${id}`);
  }

  async getCategories() {
    return await this.httpRequest.GET(`/totalcategory`);
  }

  async getFlyers() {
    return await this.httpRequest.GET(`/getFlyer`);
  }

  async getBrands() {
    return await this.httpRequest.GET(`/brandlogos`);
  }

  async getMarquee() {
    return await this.httpRequest.GET(`/getMarquee`);
  }

  async getById(code: string) {
    return await this.httpRequest.GET(`/end-point/${code}`);
  }

  async getList() {
    return await this.httpRequest.GET('/end-point');
  }

  async submit(data: any) {
    return await this.httpRequest.POST('/end-point', data, { withFormData: true });
  }

  async update(id: string, data: any) {
    return await this.httpRequest.PUT(`/end-point/${id}`, data, { withFormData: true });
  }

  async updateWithFormData(id: string, data: any) {
    return await this.httpRequest.PUT(`/end-point/${id}`, data, { withFormData: true });
  }

  async fetchWishList() {
    return await this.httpRequest.GET('/wishlist');
  }

  async fetcHlatestProducts(data: any) {
    return await this.httpRequest.GET('/random-products', data);
  }

  async fetchProduct(id: string) {
    return await this.httpRequest.GET(`/products/${id}`);
  }

  async fetchFilteredProduct(data: any) {
      return await this.httpRequest.GET(`/productfilter`, data);
  }

  async fetchAddress() {
    return await this.httpRequest.GET('/addresses');
  }

  async fetchStores() {
    return await this.httpRequest.GET('/stores');
  }

  async fetchTax(stateId: any) {
    return await this.httpRequest.GET(`/tax/${stateId}`);
  }

  async fetchStates() {
    return await this.httpRequest.GET(`/states`);
  }

  async saveAddress(data: any) {
    return await this.httpRequest.POST('/addresses', data);
  }

  async editAddress(data: any, id: any) {
    return await this.httpRequest.PUT(`/addresses/${id}`, data);
  }

  async deletAddress(id: any) {
    return await this.httpRequest.DELETE(`/addresses/${id}`);
  }

  async fetchPaymentCards(id: any) {
    return await this.httpRequest.GET(`/payment-methods`);
  }

  async savePaymentCards(data: any) {
    return await this.httpRequest.POST('/payment-methods', data);
  }

  async editPaymentCards(data: any, id: any) {
    return await this.httpRequest.PUT(`/payment-methods/${id}`, data);
  }

  async deletePaymentCards(id: any) {
    return await this.httpRequest.DELETE(`/payment-methods/${id}`);
  }

  async addToCart(data: any) {
    return await this.httpRequest.POST(`/cart`, data).then(async (res) => {
      await this.toaster.Cart()
    });
  }

  async getCartProducts() {
    return await this.httpRequest.GET(`/cart`);
  }

  async removeItemCart(id: any) {
    return await this.httpRequest.DELETE(`/cart/${id}`);
  }

  async clearCart() {
    return await this.httpRequest.DELETE(`/cart/clear`)
  }

  async updateQuantity(data: any, id: any, noToast?: boolean) {
    return await this.httpRequest.PUT(`/cart/${id}`, data).then(async (res) => {
      if (!noToast) {
        await this.toaster.Cart()
      }
    });
  }

  async fetchWishlist() {
    return await this.httpRequest.GET(`/wishlist`, {}, true);
  }

  async addToWishlist(data: any) {
    return await this.httpRequest.POST(`/wishlist`, data, { withFormData: false }, true);
  }

  async removeFromWishlist(id: any) {
    return await this.httpRequest.DELETE(`/wishlist/${id}`);
  }

  async contactUs(data: any) {
    return await this.httpRequest.POST('/contact', data)
  }

  async fetchBlogs(data: any) {
    return await this.httpRequest.GET(`/blogs`, data);
  }

  async fetchBlog(id: any) {
    return await this.httpRequest.GET(`/blogs/${id}`);
  }

  async placeOrder(data: any) {
    return await this.httpRequest.POST(`/orders`, data);
  }

  async placeOrderOnline(data: any) {
    return await this.httpRequest.POST(`/create-checkout-session`, data);
  }

  async fetchOrders(id: any) {
    return await this.httpRequest.GET(`/users/${id}/orders`);
  }

  async fetchParticularOrder(id: any) {
    return await this.httpRequest.GET(`/orders/${id}`);
  }

  async postReview(data: any) {
    return await this.httpRequest.POST(`/reviews`, data);
  }

  async updateUser(data: any) {
    return await this.httpRequest.POST(`/updateuser`, data);
  }

  async markAgeVerified(data: any) {
    return await this.httpRequest.POST(`/ageVerification`, data);
  }

  async getShippingCharges(data: any) {
    return await this.httpRequest.POST('/shipping/rate', data);
  }

}
