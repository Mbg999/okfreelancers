import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

//HTTP MODULE
import { HttpClient, HttpHeaders } from '@angular/common/http';

// URL
import { environment } from 'src/environments/environment';

// SERVICES
import { MultilangService } from './multilang.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  
  private url = environment.url;
  
  constructor(private http: HttpClient,
    public _multilangService: MultilangService){}
    
    /**
    * Places the default and optional headers for http request
    * 
    * @param options object
    */
    private placeHeaders(options:object={}, responseType: string): object {
      let headers:any = { // default headers for every request
        "X-localization": this._multilangService.activeLang,
      };
      
      Object.keys(options).forEach((key)=>{ // added headers
        headers[key] = options[key];
      });
      
      return { // parsed headers
        headers: new HttpHeaders(headers),
        responseType
      };
    }
    
    /**
     * HTTP GET request
     * 
     * @param endpoint string
     * @param options object
     */
    public get(endpoint:string, options:object={}, responseType:string='json'): Observable<any>{
      return this.http.get(`${this.url}/api${endpoint}`, this.placeHeaders(options, responseType));
    }
    
    /**
     * HTTP POST REQUEST
     * 
     * @param endpoint string
     * @param data object
     * @param options object
     */
    public post(endpoint:string, data:object, options:object={}, responseType:string='json'): Observable<any>{
      return this.http.post(`${this.url}/api${endpoint}`, data, this.placeHeaders(options, responseType));
    }
    
    /**
     * HTTP PUT REQUEST
     * 
     * @param endpoint string
     * @param data object
     * @param options object
     */
    public put(endpoint:string, data:any, options:object={}, responseType:string='json'): Observable<any>{
      return this.http.put(`${this.url}/api${endpoint}`, data, this.placeHeaders(options, responseType));
    }
    
    /**
     * HTTP DELETE REQUEST
     * 
     * @param endpoint string
     * @param options object
     */
    public delete(endpoint:string, options:object={}, responseType:string='json'): Observable<any>{
      return this.http.delete(`${this.url}/api${endpoint}`, this.placeHeaders(options, responseType));
    }
  }
  