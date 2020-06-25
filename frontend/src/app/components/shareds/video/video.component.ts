import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// SERVICES
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input('video') public video: any;
  public ready: boolean;
  @ViewChild('videoPlayer') public videoPlayer: ElementRef;
  public player: HTMLVideoElement;
  private playEvent: Subscription;

  constructor(private _fileService: FileService){

  }

  ngAfterViewInit(): void {
    this.player = this.videoPlayer.nativeElement;
    if(typeof this.video == 'string') this.player.src = this.video;
    this.player.onloadeddata = ()=>{
      this.ready = true;
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.player?.paused) this.player?.pause();
    this.ready = false;
    if(this.video && typeof this.video != 'string'){
      this.makePreviewVideo();
    }
    if(typeof this.video == 'string' && this.player){
      this.player.src = this.video;
      this.ready = true;
    };
  }

  ngOnInit(): void {
    this.playEvent = this._fileService.listenToPlaying()
    .subscribe(()=>{
      if(!this.player.paused){
        this.player.pause();
        this.player.currentTime = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.player.pause();
    this.playEvent.unsubscribe();
    this.video = undefined;
  }

  /**
   * Preview the uploaded audio, saving it into a blob format
   */
  private makePreviewVideo(): void {
    let reader = new FileReader();

    reader.onload = (event: any) => {
      try {
        this.player.src = event.target.result;
      } catch(e){
          console.error(e);
      }
    };

    reader.onerror = (event: any) => {
      console.error("File could not be read: " + event.target.error.code);
    };

    reader.readAsDataURL(this.video);
  }

  public togglePlay(){
    if(this.player.paused){
      this._fileService.startPlaying();
      setTimeout(()=>{
        this.player.play();
      }, 200);
    } else {
      this.player.pause();
    }
  }

}
