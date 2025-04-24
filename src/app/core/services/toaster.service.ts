import { Injectable } from '@angular/core';

export class Options {
    delay?: number
}

@Injectable({ providedIn: 'root' })
export class UiToasterService {

    toasts: any[] = [];

    // Un used 
    // show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    //     this.toasts.push({ textOrTpl, ...options });
    // }

    async Remove(toast: any) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

    async Success(message: string, options?: { delay?: number }) {
        this.toasts.push({ delay: 5000, textOrTpl: message, classname: 'toast-success', iconClass: 'bi bi-check-circle-fill', ...options, });
    }

    async Error(message: string, options?: { delay?: number }) {
        this.toasts.push({ delay: 5000, textOrTpl: message, classname: 'toast-error', iconClass: 'bi bi-exclamation-octagon-fill', ...options });
    }

    async Warning(message: string, options?: { delay?: number }) {
        this.toasts.push({ delay: 5000, textOrTpl: message, classname: 'toast-warning', iconClass: 'bi bi-exclamation-triangle-fill', ...options });
    }

    async Cart(options?: { delay?: number }) {
        // Remove any existing cart toast
        this.toasts = this.toasts.filter(toast => !toast.cart);
      
        // Add the new cart toast
        this.toasts.push({ 
          cart: true, 
          delay: 50000, 
          textOrTpl: '', 
          classname: 'toast-success', 
          iconClass: 'bi bi-check-circle-fill', 
          ...options 
        });
      }
      

}