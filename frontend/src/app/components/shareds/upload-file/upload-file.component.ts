import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

// SERVICES
import { FileService } from 'src/app/services/file.service';

// INTERFACES
import { ImageSize } from 'src/app/interfaces/image-size';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit, OnChanges {

  @Output('add') private add = new EventEmitter<File>();
  @Output('remove') private remove = new EventEmitter<boolean>();
  @Input('file') public file: string;
  @Input('type') public type: string;
  @Input('freelancer_picture') public freelancer_picture: string;
  @Input('clear') private clear: boolean;
  @Output('clean') private clean = new EventEmitter<boolean>();
  // IMAGE PROPERTIES
  @Input('imageType') public imageType: string;
  @Input('imagePipe') public imagePipe: string;
  @Input('imageSizeType') public imageSizeType: string;
  public imageSize: ImageSize;
  @Input('autoQuality') private autoQuality: boolean;
  @Input('quality') private quality: number;
  // AUDIO PROPIERTIES
  @Input('audioPipe') public audioPipe: string;
  // VIDEO PROPERTIES
  @Input('videoPipe') public videoPipe: string;
  public newFile: File;
  public previewFile: Blob;
  @Input('fileError') public fileError: any;
  public unsupported: boolean;

  constructor(private _fileService: FileService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.clear?.currentValue){
      this.removeFile();
      setTimeout(()=>{ // cant immediate change the clear value
        this.clean.emit(true);
      },333);
    }
  }

  ngOnInit(): void {
    this.getImageSize();
  }

  public addImage(image: HTMLInputElement): void {
    this.fileError = undefined;
    this._fileService.uploadImage(image.files[0], this.imageSize, this.autoQuality, this.quality)
    .then((resp:any)=>{
      this.newFile = resp;
      this.makePreviewImage();
      image.value = "";
      this.add.emit(resp);
    })
    .catch((err)=>{ // if some error or the user just closed the modal
      this.fileError = err;
      image.value = "";
    });
  }

  /**
   * Uses the file service for validate an audio 
   * for latter append it to create or update
   * 
   * @param audio File
   */
  public addAudio(audio: HTMLInputElement): void {
    this.fileError = undefined;
    this._fileService.uploadAudio(audio.files[0])
    .then((resp:any)=>{
      this.newFile = resp;
      audio.value = "";
      this.add.emit(resp);
    })
    .catch((err)=>{ // if some error or the user just closed the modal
      this.fileError = err;
      audio.value = "";
    });
  }

  /**
   * Uses the file service for validate a video 
   * for latter append it to create or update
   * 
   * @param video File
   */
  public addVideo(video: HTMLInputElement): void {
    this.fileError = undefined;
    this._fileService.uploadVideo(video.files[0])
    .then((resp:any)=>{
      this.newFile = resp;
      video.value = "";
      this.add.emit(this.newFile);
    })
    .catch((err)=>{ // if some error or the user just closed the modal
      this.fileError = err;
      video.value = "";
    });
  }

  /**
   * Remove the file and its preview
   */
  public removeFile(): void {
    this.newFile = undefined;
    this.previewFile = undefined;
    this.remove.emit(true);
  }

  /**
   * Preview the uploaded image, saving it into a blob format
   */
  private makePreviewImage(): void {
    let reader = new FileReader();

    reader.onload = (event: any) => {
      this.previewFile = event.target.result;
    };

    reader.onerror = (event: any) => {
      console.error("File could not be read: " + event.target.error.code);
    };

    reader.readAsDataURL(this.newFile);
  }

  private getImageSize(): void {
    switch(this.imageSizeType){
      case 'portfolio': this.imageSize = FileService.portfolioImageSize; break;
      case 'category': this.imageSize = FileService.categoryImageSize; break;
      case 'freelancer': this.imageSize = FileService.freelancerPictureSize; break;
      default: this.imageSize = FileService.pictureLogoSize; break;
    }
  }

}
