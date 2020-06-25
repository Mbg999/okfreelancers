import { Pipe, PipeTransform } from '@angular/core';

// URL
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'audio'
})
export class AudioPipe implements PipeTransform {

  transform(value: string, type: string): string {
    return (value) ? `${environment.url}/assets/audios/${type}/${value}` : null;
  }

}
