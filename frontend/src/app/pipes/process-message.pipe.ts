import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// SERVICES
import { MultilangService } from '../services/multilang.service';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'processMessage'
})
export class ProcessMessagePipe implements PipeTransform {

  constructor(private _multilangService: MultilangService,
    protected sanitizer: DomSanitizer){}

  transform(text: string, noHtml: boolean = false): SafeHtml {
    let aux = text.split(':');
    return this.sanitizer.sanitize(SecurityContext.HTML,
      this.sanitizer.bypassSecurityTrustHtml(this.processMessage(aux[1], aux[2],
        (aux[3]) ? aux[3] : null,
        (aux[4]) ? aux[4] : null,
        (aux[5]) ? aux[5] : null,
        noHtml)
      )
    );
  }

  private processMessage(type: string, role: string, action: string, item_id: string, item_additional_text:string, noHtml: boolean): string {
    let text;
    switch(type){ // possible implementation of more types, like images
      case 'offer_status': 
        text = `${this._multilangService.translate(`offers.chat.${role}.${action}`, {title: item_additional_text})}`;
        if(role == 'company' && action == 'accept'){
          if(noHtml){
            text += ` ${this._multilangService.translate('offers.chat.link')}.`;
          } else {
            // innerHTML does not support angular directives (routerLink)
            text += ` <a class="text-warning" href="${environment.frontUrl}/company/project/${item_id}">${this._multilangService.translate('offers.chat.link')}</a>.`;
          }
        }
        return text;
      case 'job_status':
        text = `${this._multilangService.translate(`jobs.chat.${role}.${action}`, {title: item_additional_text})}`;
        return text;
      default: return `${type} unsupported`;
    }
  }

}
