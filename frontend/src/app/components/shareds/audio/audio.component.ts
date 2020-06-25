import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

// SERVICES
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css']
})
export class AudioComponent implements OnChanges, OnInit, OnDestroy {

  @Input('img') public img: string;
  @Input('audio') public audio: any;
  @Input('side_btns') public side_btns: boolean;
  public ready: boolean;
  public player = new Audio();
  private playEvent: Subscription;

  constructor(private _fileService: FileService){
    this.player.onloadeddata = ()=>{
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

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.player.paused) this.player.pause();
    this.ready = false;
    if(this.audio){
      if(typeof this.audio != 'string') {
        this.makePreviewAudio();
      } else  {
        this.player.src = this.audio;
      }
    }
  }

  ngOnDestroy(): void {
    this.player.pause();
    this.playEvent.unsubscribe();
    this.audio = undefined;
  }

  /**
   * Preview the uploaded audio, saving it into a blob format
   */
  private makePreviewAudio(): void {
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

    reader.readAsDataURL(this.audio);
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
