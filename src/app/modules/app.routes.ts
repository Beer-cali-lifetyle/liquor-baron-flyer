
import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
// import { AuthGuard } from '../core/guards/auth.guard';


const ModuleRoutes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    {
        path: 'home', loadComponent: () => import('./index').then(c => c.HomeComponent)
    },
    {
        path: 'about', loadComponent: () => import('./index').then(c => c.AboutUsComponent)
    },
    {
        path: 'contact', loadComponent: () => import('./index').then(c => c.ContactComponent)
    },
    {
        path: 'shop', loadComponent: () => import('./index').then(c => c.ShopListComponent)
    },
    {
        path: 'pwa', loadComponent: () => import('./index').then(c => c.PwaPromptComponent)
    },
    {
        path: 'product/:id', loadComponent: () => import('./index').then(c => c.ProductInfoComponent)
    },
    {
        path: 'shop/product/:id', loadComponent: () => import('./index').then(c => c.ProductInfoComponent)
    },
    {
        path: 'our-store', loadComponent: () => import('./index').then(c => c.OurStoreComponent)
    },
    {
        path: 'my-account', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.MainComponent)
    },
    {
        path: 'terms-conditions', loadComponent: () => import('./index').then(c => c.TermsConditionsComponent)
    },
    {
        path: 'privacy-cookies', loadComponent: () => import('./index').then(c => c.PrivacyCookiesComponent)
    },
    {
        path: 'delivery', loadComponent: () => import('./index').then(c => c.DeliveryComponent)
    },
    {
        path: 'returns', loadComponent: () => import('./index').then(c => c.ReturnsComponent)
    },
    {
        path: 'faqs', loadComponent: () => import('./index').then(c => c.FaqsComponent)
    },
    {
        path: 'shop/product/:id', loadComponent: () => import('./index').then(c => c.ProductInfoComponent)
    },
    {
        path: 'hls', loadComponent: () => import('./index').then(c => c.HlsPlayerComponent)
    },
    {
        path: 'cart', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.ShoppingCartComponent)
    },
    {
        path: 'checkout', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.CheckoutComponent)
    },
    {
        path: 'order-confirmation', loadComponent: () => import('./index').then(c => c.OrderConfirmedComponent)
    },
    {
        path: 'order-reject', loadComponent: () => import('./index').then(c => c.OrderRejectedComponent)
    },
    // {
    //     path: 'collection', loadComponent: () => import('./index').then(c => c.CollectionComponent)
    // },
    // {
    //     path: 'wishlist', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.WishlistComponent)
    // },
    // {
    //     path: 'profile', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.ProfileComponent)
    // },
    // {
    //     path: 'shopping-cart', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.ShoppingCartComponent)
    // },
    // {
    //     path: 'magazines', loadComponent: () => import('./index').then(c => c.BlogListComponent)
    // },
    // {
    //     path: 'magazines/:id', loadComponent: () => import('./index').then(c => c.BlogComponent)
    // },
    // {
    //     path: 'orders', canActivate: [AuthGuard], loadComponent: () => import('./index').then(c => c.OrdersComponent)
    // },
]

export default ModuleRoutes