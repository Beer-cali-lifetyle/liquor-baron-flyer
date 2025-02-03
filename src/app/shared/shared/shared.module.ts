import { NgModule, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
  ]
})
export class SharedModule {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

}
