import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiLoaderService {

  private activeRequests = 0; // Counter for active API calls
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  public onLoad(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  public start() {
    this.activeRequests++;
    this.isLoadingSubject.next(true);
  }

  public stop() {
    this.activeRequests = Math.max(0, this.activeRequests - 1); // Ensure counter doesn't go negative
    if (this.activeRequests === 0) {
      this.isLoadingSubject.next(false);
    }
  }
}
