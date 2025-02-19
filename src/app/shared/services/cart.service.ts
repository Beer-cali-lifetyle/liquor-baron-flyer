import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartUpdateSubject = new BehaviorSubject<boolean>(false);

  cartUpdated$ = this.cartUpdateSubject.asObservable();

  triggerCartUpdate() {
    this.cartUpdateSubject.next(true);
  }
}
