import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../../shared/services/common.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService, 
        private router: Router, 
        private commonService: CommonService,
        @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
    ) { }

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        if (isPlatformBrowser(this.platformId) && await this.authService.isTokenValid()) {
            return true;
        } else {
     this.router.navigate(['/auth/sign-in']);
            return false;
        }
    }
}
