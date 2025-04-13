import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContextService } from '../../../core/services/context.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(private context: ContextService) {

  }

  clearSiteData() {
    // ✅ Clear Local Storage
    localStorage.clear();
  
    // ✅ Clear Session Storage
    sessionStorage.clear();
  
    // ✅ Clear Cookies
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "") // Remove spaces
        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });
  
    // ✅ Clear IndexedDB
    indexedDB.databases().then((databases) => {
      databases.forEach((db) => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  
    // ✅ Clear Cache Storage (Service Worker Cache)
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }

    this.context.resetAppState();
  
    // ✅ Reload the Page to Ensure Full Cleanup
    setTimeout(() => {
      location.reload();
    }, 500); // Small delay to allow cleanup
  }
  

}
