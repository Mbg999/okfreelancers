import { Pipe, PipeTransform } from '@angular/core';

// URL
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'video'
})
export class VideoPipe implements PipeTransform {

  transform(value: string, type: string): string {
    return (value) ? `${environment.url}/assets/videos/${type}/${value}` : null;
  }

}
