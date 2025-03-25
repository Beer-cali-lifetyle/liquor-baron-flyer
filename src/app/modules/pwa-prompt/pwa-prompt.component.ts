import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-pwa-prompt',
  templateUrl: './pwa-prompt.component.html',
  styleUrls: ['./pwa-prompt.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PwaPromptComponent implements OnInit {
  deferredPrompt: any;
  isPWAInstalled: boolean = false;

  ngOnInit(): void {
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: any) {
    event.preventDefault();
    debugger;
    this.deferredPrompt = event;
    
    setTimeout(() => {
      this.isPWAInstalled = true;  // Show the install button after 5 seconds
    }, 0);  // Delay in milliseconds
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