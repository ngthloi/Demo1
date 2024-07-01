import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css']
})
export class MjpegStreamComponent implements OnInit, OnDestroy {
  @Input() src: string | undefined;
  isStreaming: boolean = false;
  currentEvent: any;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('pauseCanvas') pauseCanvas!: ElementRef;
  private intervalId: any;
  public displaySrc: string | undefined;
  private pausedSrc: string | undefined;
  isFullScreen: boolean = false;
  errorSrc: string = 'assets/errorr.jpg'; 
  isError: boolean = false; 

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.stopStream();
  }

  startStream(): void {
    if (!this.isStreaming && this.src) {
      this.isStreaming = true;
      this.updateStream(true);
    }
  }

  stopStream(): void {
    if (this.isStreaming) {
      this.isStreaming = false;
      clearInterval(this.intervalId);
    }
  }

  playStream(): void {
    const canvas = this.pauseCanvas.nativeElement;
    canvas.style.display = 'none'; // Hide canvas when stream plays
    this.isError = false; // Reset error state
    if (this.src && this.pausedSrc) {
      this.isStreaming = true;
      this.updateStream();
    } else {
      this.startStream();
    }
  }

  pauseStream(): void {
    if (this.isStreaming) {
      this.pausedSrc = this.displaySrc;
      this.stopStream();
      setTimeout(() => {
        this.captureFrame(); // Capture the current frame to the canvas
      }, 100); 
    }
  }

  updateStream(fetchLatest: boolean = false): void {
    if (this.src) {
      if (fetchLatest) {
        this.displaySrc = this.src + '?' + new Date().getTime(); // Fetch the latest image immediately
      }
      clearInterval(this.intervalId); 
      this.intervalId = setInterval(() => {
        if (this.isStreaming) {
          const img = new Image();
          img.src = this.src + '?' + new Date().getTime();
          img.onload = () => {
            this.displaySrc = img.src;
            this.isError = false;
          };
          img.onerror = () => {
            this.isError = true; 
          };
        }
      }, 1000); 
    } else if (this.pausedSrc) {
      this.displaySrc = this.pausedSrc; 
    }
  }

  toggleFullScreen(): void {
    const elem = this.videoElement.nativeElement;
    if (!this.isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      this.isFullScreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      this.isFullScreen = false;
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:msfullscreenchange', ['$event'])
  onFullScreenChange(): void {
    this.isFullScreen = !!(document.fullscreenElement || (document as any).mozFullScreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
  }

  captureFrame(): void {
    const videoElement = this.videoElement.nativeElement as HTMLImageElement;
    const canvas = this.pauseCanvas.nativeElement as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = videoElement.naturalWidth;
      canvas.height = videoElement.naturalHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.style.display = 'block'; // Show the canvas when the stream is paused
      console.log('Frame captured and displayed on canvas');
    } else {
      console.error("Could not get canvas context");
    }
  }
}
