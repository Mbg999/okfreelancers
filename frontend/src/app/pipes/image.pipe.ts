import { Pipe, PipeTransform } from '@angular/core';

// URL
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  /**
   * returns the image url, if there is no image, it returns a default frontend image
   * 
   * @param value image
   * @param type users | categories | portfolios
   * @param isBGImg boolean, optional, its background image or not
   */
  transform(value: string, type: string, isBGImg: boolean=false): string {
    let url;
    if(value){
      url = `${environment.url}/assets/images/${type}/${value}`;
    } else {
      url = `assets/images/noimg_${type.replace('/', '-')}.png`;
    }

    if(isBGImg){
      url = `url(${url})`;
    }

    return url;
  }

}
