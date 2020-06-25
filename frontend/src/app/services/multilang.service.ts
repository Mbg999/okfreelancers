import { Injectable, EventEmitter/*, Inject, PLATFORM_ID, Optional*/ } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MultilangService {

  private langs: string[] = ['en', 'es']; // available langs
  public activeLang: string;

  constructor(private translateService: TranslateService) {
    this.setDefaultLang();
  }

  /**
   * Translates a i18n keyword
   * 
   * @param key string
   * @param params object
   */
  public translate(key: string, params:object=null): any {
    return this.translateService.instant(key, params);
  }

  /**
   * Translates a i18n keyword in stream,
   * if the language changes, it returns the translation to the current language
   * 
   * @param key string
   * @param params object
   */
  public translateStream(key:string[], params:object=null): Observable<any>{
    return this.translateService.stream(key, params);
  }

  /**
   * Event to determinate when the language is changed
   */
  public onLangChangeEvent():EventEmitter<LangChangeEvent>{
    return this.translateService.onLangChange;
  }

  /**
   * changes the language
   * 
   * @param lang string
   */
  public useLanguage(lang: string): void {
    this.activeLang = lang; // this sould be first than .use, the onLangChangeEvent should shots after this activeLang change
    this.translateService.use(lang);
    localStorage.setItem('language', this.activeLang);
  }

  /**
   * Default language to use when the web is openned,
   * it uses localStorage to save the current lang
   * 
   * if the user has no items stored, it uses the browser language
   * if the browser lang is a not translated one, it uses the english as default
   */
  public setDefaultLang(): void {
    this.activeLang = (localStorage.getItem('language')) ?
      localStorage.getItem('language') :
      this.translateService.getBrowserLang();
    if (this.langs.indexOf(this.activeLang) > -1) {
      this.translateService.setDefaultLang(this.activeLang);
    } else {
      this.activeLang = 'en';
      this.translateService.setDefaultLang(this.activeLang);
    }
  }
}
