import {
    Injectable,
    WritableSignal,
    signal,
    Inject,
    PLATFORM_ID,
    HostListener
  } from "@angular/core";
  import { isPlatformBrowser } from '@angular/common';
  
  interface User {
    id: number;
    name: string;
    email: string;
    is_guest: any;
    // Add more fields as needed
  }

  export interface SubCategory {
    id: number; // Assuming `id` is a numeric identifier
    subcategory_name: string; // The name of the subcategory
  }
  
  @Injectable({ providedIn: 'root' })
  export class ContextService {
    user: WritableSignal<User | null> = signal(null);
    cart: WritableSignal<any | null> = signal(null);
    sub_categories: WritableSignal<SubCategory[] | null> = signal([]);
  
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
      this.loadFromLocalStorage();
    }
  
    private loadFromLocalStorage() {
      if (isPlatformBrowser(this.platformId)) {
        const storedUser = localStorage.getItem('user');
        const cart: any = localStorage.getItem('cart');
        const sub_categories: any = localStorage.getItem('sub_categories');
        if (storedUser !== null) {
          try {
            this.user.set(JSON.parse(storedUser));
            this.cart.set(JSON.parse(cart));
            this.sub_categories.set(JSON.parse(sub_categories));
          } catch (error) {
            console.error('Error parsing local storage for user:', error);
          }
        }
      }
    }
  
    @HostListener("window:beforeunload", ["$event"])
    unloadHandler(event: Event) {
      this.saveToLocalStorage();
    }
  
    saveToLocalStorage() {
      if (isPlatformBrowser(this.platformId)) {
        const currentUser = this.user();
        const cartStatus = this.cart();
        const sub_categories = this.sub_categories();
        if (currentUser !== null) {
          localStorage.setItem('user', JSON.stringify(currentUser));
          localStorage.setItem('cart', JSON.stringify(cartStatus));
          localStorage.setItem('sub_categories', JSON.stringify(sub_categories));
        }
      }
    }
  
    public clearLocalStorage() {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        localStorage.removeItem('sub_categories');
      }
    }
  }
  