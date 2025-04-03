import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { ContextService } from '../../../core/services/context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  subCategories: any[] = [];
  marquees: any = [];
  isNavbarCollapsed: boolean = true;
  mainNavClass = 'main-nav'; // Default class for navigation
  scrolledClass = 'main-nav-scrolled'; // Class to add on scroll
  headerHeight: number = 0; // To store header height dynamically

  constructor(private ApiService: ApiService, private eRef: ElementRef, private router: Router, public contextService: ContextService) { }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target) && !(this.isNavbarCollapsed)) {
      this.toggleNavbar()
    }
  }


  async ngOnInit() {
    await this.fetchFlyers();
    await this.fetchMarquee();
  }

  ngAfterViewInit() {
    const headerElement = document.querySelector('header') as HTMLElement;
    if (headerElement) {
      this.headerHeight = headerElement.offsetHeight;
    }

  }
  consoleCart() {
    console.log(this.contextService.cart())
  }

  async fetchCategories() {
    await this.ApiService.getCategories().then(async (res) => {
      this.subCategories = res?.categories[0]?.subcategories;
      this.contextService.flyers.set(res?.categories[0]?.subcategories);
    });
  }

  async fetchFlyers() {
    await this.ApiService.getFlyers().then((res) => {
      this.subCategories = res?.data;
      this.contextService.flyers.set(res?.data);
    })
  }

  async fetchMarquee() {
    await this.ApiService.getMarquee().then((res) => {
      this.marquees = res?.data;
    })
  }

  getCartNumber() {
    const cartData = this.contextService.cart()?.data;

    const totalQuantity = cartData?.reduce((sum: any, item: any) => {
      return sum + (item.quantity ?? 0);
    }, 0) || 0;

    return totalQuantity
  }

  redirectToShopList(type: string, id: number, title: string) {
    if (type === 'category') {
      this.router.navigate(['/shop'], { queryParams: { categoryId: id, title: title } });
    } else if (type === 'subcategory') {
      this.router.navigate(['/shop'], { queryParams: { subcategoryId: id, title: title } });
    } else if (type === 'flyer') {
      this.router.navigate(['/shop'], { queryParams: { flyerId: id, title: title } });
    }
    this.isNavbarCollapsed = true;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isNavbarCollapsed) {
      this.isNavbarCollapsed = true;
    }
    const navElement = document.querySelector('.main-nav') as HTMLElement;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPosition > this.headerHeight) {
      navElement.classList.add(this.scrolledClass);
    } else {
      navElement.classList.remove(this.scrolledClass);
    }
  }

}