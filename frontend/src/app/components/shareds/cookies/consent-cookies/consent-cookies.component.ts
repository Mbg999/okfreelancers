import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// SERVICES
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';

@Component({
  selector: 'app-consent-cookies',
  templateUrl: './consent-cookies.component.html',
  styleUrls: ['./consent-cookies.component.css']
})
export class ConsentCookiesComponent implements OnInit {

  @Output('consented') private consented = new EventEmitter<boolean>();

  constructor(private _dialogService: DialogService,
    private _multilangService: MultilangService) { }

  ngOnInit(): void {
  }

  public accept(){
    localStorage.setItem('consentedCookies', '1');
    this.consented.emit(true);
  }

  public refuse(){
    this._dialogService.iconless(
      // TEXT
      `<p>${this._multilangService.translate('cookies.refuse_cookies_text')}</p>`,
      // TITLE
      this._multilangService.translate('cookies.are_you_sure'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('cookies.accept'),
      // SHOW CANCEL BUTTON
      true,
      // CANCEL BUTTON TEXT
      this._multilangService.translate('cookies.refuse'),
      // CONFIRM BUTTON COLOR
      '#00b5d7',
      // CANCEL BUTTON COLOR
      '#1a1a1a '
    ).then((result)=>{
      if(result.value){
        this.accept();
      } else {
        window.location.href = 'https://www.google.com';
      }
    });
  }

}
