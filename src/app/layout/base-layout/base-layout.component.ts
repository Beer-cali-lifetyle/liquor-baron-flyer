import { Component, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from "../components/header/header.component";
import { FooterComponent } from "../components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { NewsLetterComponent } from "../components/news-letter/news-letter.component";

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet, LoaderComponent, NewsLetterComponent],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss'
})
export class BaseLayoutComponent implements AfterViewInit {

  @ViewChild('header', { read: ElementRef }) header!: ElementRef;

  ngAfterViewInit() {
    // this.updateHeaderHeight();
  }

  // @HostListener('window:resize', [])
  // onResize() {
  //   this.updateHeaderHeight();
  // }

  // private updateHeaderHeight(): void {
  //   setTimeout(() => {
  //     if (this.header?.nativeElement) {
  //       const height = this.header.nativeElement.offsetHeight;
  //       console.log("Header Height:", height);
  //       document.documentElement.style.setProperty('--header-height', `${height}px`);
  //     } else {
  //       console.warn("Header reference is not available.");
  //     }
  //   }, 500); 
  // }
}
