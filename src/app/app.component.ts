import { Component, HostListener  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/ui/loader/loader.component';
import { ToasterComponent } from './shared/ui/toaster/toaster.component';
import { Router, Event, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToasterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  title = 'liquor-baron';
  deferredPrompt: any;
  showInstallPrompt: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }
    });
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: any) {
    event.preventDefault();
    this.deferredPrompt = event;
    
    setTimeout(() => {
      this.showInstallPrompt = true;  // Show the install button after 5 seconds
    }, 5000);  // Delay in milliseconds
  }
  

  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();  // Show the install prompt
      this.deferredPrompt.userChoice.then((result: any) => {
        console.log(result.outcome);  // Log the result of the prompt
        this.deferredPrompt = null;  // Reset the deferred prompt
      });
    }
  }
}
