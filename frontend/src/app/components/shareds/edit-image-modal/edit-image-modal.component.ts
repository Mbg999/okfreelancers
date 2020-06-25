import { Component, ViewChild, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

// CROPPER
import Cropper from "cropperjs";

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// INTERFACES
import { ImageSize } from 'src/app/interfaces/image-size';

@Component({
  selector: 'app-edit-image-modal',
  templateUrl: './edit-image-modal.component.html',
  styleUrls: ['./edit-image-modal.component.css']
})
export class EditImageModalComponent implements OnInit, OnDestroy {
  // image editing view
  @ViewChild("image", { static: false }) public imageElement: ElementRef;

  // params
  @Input("file") public file: File;
  @Input("size") public size: ImageSize;
  @Input("autoQuality") public autoQuality: boolean;
  @Input("quality") public quality: number;
  // img to edit
  public img: string;
  // img edited view
  public imageDestination: string;
  // cropper and canvas that cropper uses
  private cropper: Cropper;
  private canvas: HTMLCanvasElement;

  constructor(public activeModal: NgbActiveModal) {}

  public ngOnInit(): void {
    this.prepareToCrop();
  }

  ngOnDestroy(): void {
    // this.file = undefined;
  }

  /**
   * set the image param to edit into the crop editing element (view)
   */
  private prepareToCrop(): void {
    this.imageDestination = ""; // avoid undefined error, i pref this over a ngIf
    let reader = new FileReader();

    reader.onload = (event: any) => {
      this.img = event.target.result;
    };

    reader.onloadend = () => { // giving time to load the img
      this.crop();
    }

    reader.onerror = (event: any) => {
      console.error("File could not be read: " + event.target.error.code);
      this.activeModal.dismiss(event.target.error.code);
    };

    reader.readAsDataURL(this.file);
  }

  /**
   * starts the cropper object
   */
  private crop(){
    // https://www.thepolyglotdeveloper.com/2019/06/image-cropping-zooming-scaling-angular-javascript/
    // https://github.com/fengyuanchen/cropperjs/blob/master/README.md
    this.cropper = new Cropper(this.imageElement.nativeElement, {
      zoomable: true,
      zoomOnTouch: true,
      zoomOnWheel: true,
      scalable: false,
      aspectRatio: this.size.width/this.size.height,
      cropBoxResizable: false,
      dragMode: 'move',
      toggleDragModeOnDblclick: false,
      crop: () => {
        this.canvas = this.cropper.getCroppedCanvas({
          width: this.size.width,
          height: this.size.height,
          imageSmoothingQuality: "medium",
          fillColor: '#fff'
        });
        this.imageDestination = this.canvas.toDataURL(this.file.type, this.quality); // better performance than toBlob
      }
    });
  }

  /**
   * It looks for canvas.toBlob compatibility and calls to produce the file
   */
  public saveFile(){
    if (!HTMLCanvasElement.prototype.toBlob) { // toBlob not supported (IE11, Edge)
      // polyfill from https://developer.mozilla.org/es/docs/Web/API/HTMLCanvasElement/toBlob
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
       value: function (callback, type, quality) {
     
         var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
             len = binStr.length,
             arr = new Uint8Array(len);
     
         for (var i=0; i<len; i++ ) {
          arr[i] = binStr.charCodeAt(i);
         }
     
         callback( new Blob( [arr], {type: type || 'image/png'} ) );
       }
      });
    }
    this.produceFile();
  }

  /**
   * It produces the final file, compressed if needed
   */
  private produceFile(){
    this.canvas.toBlob((blob)=>{ // blob for file, file for multipart/form-data

      if (navigator.msSaveBlob) {  // new File not supported (IE11, Edge)
        this.file = this.blobToFile(blob, this.file.name);
      } else {
        this.file = new File([blob], this.file.name, {
          lastModified: new Date().getTime(),
          type: this.file.type
        });
      }
      
      if(this.autoQuality && this.file.size/1024 > 2048) { // reducing the quality until the file get lower than 2MB
        this.quality -= 0.05;
        this.produceFile();
      } else {
        this.activeModal.close(this.file);
      }
      
    },this.file.type, this.quality);
  }

  /**
   * cast blob to file
   * 
   * https://stackoverflow.com/a/55150342/9764641
   * 
   * @param theBlob Blob
   * @param fileName string
   */
  private blobToFile(theBlob: Blob, fileName: string): File {
    const b: any = theBlob;
    b.lastModifiedDate = new Date().getTime();
    b.name = fileName;
    return b as File;
  }
}
