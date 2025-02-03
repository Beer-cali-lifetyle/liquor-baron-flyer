import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiLoaderService {

  public isLoading = new BehaviorSubject(false);

  public subject = new Subject<boolean>();
    
  constructor() { }

  public onLoad() :Observable<boolean>{
    return this.isLoading.asObservable();
  }

  public async start() {
    this.isLoading.next(true);
  } 

  public async stop(){
    this.isLoading.next(false);
  } 
}
