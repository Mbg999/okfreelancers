import { Injectable } from '@angular/core';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { EditImageModalComponent } from 'src/app/components/shareds/edit-image-modal/edit-image-modal.component';

// INTERFACES
import { ImageSize } from '../interfaces/image-size';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // default images values
  public static pictureLogoSize: ImageSize;
  public static categoryImageSize: ImageSize;
  public static freelancerPictureSize: ImageSize;
  public static portfolioImageSize: ImageSize;
  private static playing = new Subject<boolean>();

  constructor(private modalService: NgbModal) {
      FileService.pictureLogoSize = {
        width: 260,
        height: 260,
        previewClass: "picture_div"
      }

      FileService.categoryImageSize = {
        width: 1110,
        height: 243,
        previewClass: "preview-category"
      }

      FileService.freelancerPictureSize = {
        width: 508,
        height: 303,
        previewClass: "preview-portfolio-image"
      }

      FileService.portfolioImageSize = {
        width: 800,
        height: 476,
        previewClass: "preview-portfolio-image"
      }
  }


  /**
   * Uploads a file, it validates that the file is a correct image,
   * if its ok, it opens the editImageModal, it returns a promise with
   * the edited file ready to upload to the server
   * 
   * @param image File
   * @param size ImageSize
   * @param quality number, decimal, 0 to 1
   */
  public uploadImage(image: File, size: ImageSize, autoQuality: boolean=true, quality: number=0.7): Promise<any> {
      let type = 'image/';
      return this.validateFile(image, [`${type}jpg`,`${type}jpeg`,`${type}png`], autoQuality, 2)
      .then((file)=>this.editImageModal(file, size, autoQuality, quality));
  }

  /**
   * Opens the edit image modal, for edit the image size and quality
   * 
   * @param image File
   * @param size ImageSize
   * @param quality number, decimal, 0 to 1
   */
  private editImageModal(image: File, size: ImageSize, autoQuality:boolean, quality:number): Promise<any> {
    const modalRef: NgbModalRef = this.modalService.open(EditImageModalComponent,{
      scrollable: false,
      size: "lg",
      windowClass: 'animated fadeInDown faster'
    });
      
    modalRef.componentInstance.file = image;
    modalRef.componentInstance.size = size;
    modalRef.componentInstance.autoQuality = autoQuality;
    modalRef.componentInstance.quality = quality;

    return modalRef.result;
  }

  /**
   * Uploads a file, it validates that the file is a correct audio,
   * it returns a promise with the audio file ready to upload to the server
   * 
   * @param audio File
   */
  public uploadAudio(audio: File): Promise<any> {
    let type = 'audio/';
    return this.validateFile(audio, [`${type}ogg`,`${type}mpeg`,`${type}wav`], false, 3);
  }

  /**
   * Uploads a file, it validates that the file is a correct audio,
   * it returns a promise with the audio file ready to upload to the server
   * 
   * @param audio File
   */
  public uploadVideo(video: File): Promise<any> {
    return this.validateFile(video, ['video/mp4'], false, 3);
  }

  /**
   * Validates the extension and size of a file,
   * returns a promise with the file as then, or the error as catch
   * 
   * @param file File
   * @param avalilableTypes string[]
   * @param autoSize boolean, if the caller has an autosize sistem
   * @param maxMBSize number
   */
  private validateFile(file: File, avalilableTypes: string[], autoSize: boolean=true, maxMBSize: number=null): Promise<any> {
    return new Promise((resolve, reject)=>{
      if(file){ // user didn't cancel the operation
        if(avalilableTypes.indexOf(file.type) < 0){ // valid file type
          reject({err:'miscellaneous.invalid_file_type'});
        } else {
          if(!autoSize && file.size/1024/1024 > maxMBSize){ // if size is higher than 2MB, its a too heavy size
            reject({err:'miscellaneous.too_heavy_size', mb:maxMBSize});
          } else {
            resolve(file);
          }
        }
      } else {
        reject();
      }
    });
  }

  public startPlaying(): void {
    FileService.playing.next(true);
  }

  public listenToPlaying(): Observable<boolean> {
    return FileService.playing.asObservable();
  }
}
