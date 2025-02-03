import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { timeout } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { UiLoaderService } from '../../core/services/loader.service';

export interface Options {
  withFormData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HttpServie {

  queryParams: any = {};
  private isBrowser: boolean;

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Inject a loader service if available
    private loaderService: UiLoaderService // Assuming you have a loader service
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      console.log(window.navigator.onLine ? 'Internet Connection Enabled' : 'Internet Connection Disabled');
    }
  }

  private toggleLoader(show: boolean): void {
    if (show) {
      this.loaderService.start(); 
    } else {
      this.loaderService.stop(); 
    }
  }

  /**
   * Perform a get request to the API
   */
  async GET(endpoint: string, params: any = {}, withLoader: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!withLoader) this.toggleLoader(true); 
        this.queryParams = params;
        const result = this.httpClient.get(HttpServie.getApiUrl() + endpoint, await this.buildRequestOptions())
          .pipe();
        result.subscribe(async (response: any) => {
          if (!withLoader) this.toggleLoader(false); 
          resolve(response);
        }, (error) => {
          if (!withLoader) this.toggleLoader(false); 
          reject(error);
        });
        this.queryParams = {};
      } catch (e) {
        console.log('Caught exception in GET request: ', e);
        if (!withLoader) this.toggleLoader(false); 
        reject(null);
        return;
      }
    });
  }

  /**
   * Perform a post request to the server.
   */
  async POST(endpoint: string, data: any | FormData = null, options: Options = { withFormData: false }, withLoader: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let result: Observable<any>;
      try {
        if (!withLoader) this.toggleLoader(true); // Show loader
        result = await this.httpClient.post(HttpServie.getApiUrl() + endpoint, data, await this.buildRequestOptions(options)).pipe();
        result.subscribe(async (response: any) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader
          resolve(response);
        }, (error) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader on error
          reject(error);
        });
      } catch (e) {
        console.log('Caught exception in POST request: ', e);
        if (!withLoader) this.toggleLoader(false); // Hide loader on exception
        reject(null);
        return;
      }
    });
  }

  /**
   * Perform a put request to the server.
   */
  async PUT(endpoint: string, data: any | FormData = null, options: Options = { withFormData: false }, withLoader: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let result: Observable<any>;
      try {
        if (!withLoader) this.toggleLoader(true); // Show loader
        result = await this.httpClient.put(HttpServie.getApiUrl() + endpoint, data, await this.buildRequestOptions(options)).pipe();
        result.subscribe(async (response: any) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader
          resolve(response);
        }, (error) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader on error
          reject(error);
        });
      } catch (e) {
        console.log('Caught exception in PUT request: ', e);
        if (!withLoader) this.toggleLoader(false); // Hide loader on exception
        reject(null);
        return;
      }
    });
  }

  /**
   * Perform a delete request to the server.
   */
  async DELETE(endpoint: string, withLoader: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let result: Observable<any>;
      try {
        if (!withLoader) this.toggleLoader(true); // Show loader
        result = await this.httpClient.delete(HttpServie.getApiUrl() + endpoint, await this.buildRequestOptions()).pipe();
        result.subscribe(async (response: any) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader
          resolve(response);
        }, (error) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader on error
          reject(error);
        });
      } catch (e) {
        console.log('Caught exception in DELETE request: ', e);
        if (!withLoader) this.toggleLoader(false); // Hide loader on exception
        reject(null);
        return;
      }
    });
  }

  /**
   * Perform a download request to the server.
   */
  BLOB(Url: string, withLoader: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!withLoader) this.toggleLoader(true); // Show loader
        const result = this.httpClient.get(Url, { responseType: 'blob' }).pipe();
        result.subscribe(async (response: any) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader
          resolve(response);
        }, (error) => {
          if (!withLoader) this.toggleLoader(false); // Hide loader on error
          reject(error);
        });
      } catch (e) {
        console.log('Caught exception in DOWNLOAD request: ', e);
        if (!withLoader) this.toggleLoader(false); // Hide loader on exception
        reject(null);
        return;
      }
    });
  }


  /**
   * Generate the request options for all HttpClient calls.
   */
  private async buildRequestOptions($options: Options = { withFormData: false }, $headers: any = {}) {
    return { headers: await this.buildHeaders($options, $headers), params: await this.buildQueryParams(), withCredentials: true };
  }

  /**
   * Generate the headers required for all requests.
   */
  private async buildHeaders($options: Options, $headers: any = {}) {
    const headers: { Authorization?: string, 'Content-Type'?: string } = {
      'Content-Type': 'application/json'
    };

    if ($options?.withFormData) {
      delete headers['Content-Type'];
    }

    if (this.isBrowser && localStorage.getItem('access_token')) {
      headers.Authorization = 'Bearer ' + localStorage.getItem('access_token');
    }

    return new HttpHeaders(headers);
  }

  private async buildQueryParams() {
    let httpParams = new HttpParams();
    Object.keys(this.queryParams).forEach((key) => {
      httpParams = httpParams.append(key, this.queryParams[key]);
    });
    return httpParams;
  }

  /**
   * Get the API URL from environment settings.
   */
  private static getApiUrl(): string {
    const base_url = `${environment.api.base_url}/api`
    return base_url;
  }
}
