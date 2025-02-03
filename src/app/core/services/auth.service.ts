import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { ContextService } from './context.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    public contextService: ContextService,
    @Inject(PLATFORM_ID) private platformId: Object // Inject platform ID
  ) {}

  async isTokenValid() {
    const token = this.getToken();
    const user = await this.getUser();
    if (token && user) {
      return true;
    }
    return false;
  }

  getToken(): string | null {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null; // Return null if not in the browser
  }

  setToken(token: string): void {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
  }

  removeToken(): void {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
  }

  async getUser() {
    // Implement similar platform checks for user retrieval logic
    if (isPlatformBrowser(this.platformId)) {
      const user = await this.contextService.user() || localStorage.getItem('user');
      if (!user) {
        try {
          const userId = localStorage.getItem('user_id');
          // Implement user fetching logic from API if needed
          return true; // Placeholder: Return the actual user data
        } catch (error) {
          console.error('Error getting user role:', error);
          return null;
        }
      } else {
        return user;
      }
    }
    return null; // Return null if not in the browser
  }
}
