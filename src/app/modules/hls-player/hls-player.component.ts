import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import Hls from 'hls.js';

@Component({
  selector: 'app-hls-player',
  templateUrl: './hls-player.component.html',
  styleUrls: ['./hls-player.component.css'],
  standalone: true,
})
export class HlsPlayerComponent implements OnInit, OnDestroy {
videoUrl: string = 'https://shucaeimage.blr1.digitaloceanspaces.com/hls/fda052d1-648d-4727-8270-98460e0ce997/video.m3u8'; // URL of the HLS stream
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;

  private hls!: Hls;

  ngOnInit(): void {
    if (Hls.isSupported() && this.videoUrl) {
      this.hls = new Hls();
      this.hls.loadSource(this.videoUrl);
      this.hls.attachMedia(this.videoPlayer.nativeElement);
    } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for Safari (native HLS support)
      this.videoPlayer.nativeElement.src = this.videoUrl;
    }
  }

  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}
