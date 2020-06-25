import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';
import { Offer } from '../interfaces/offer';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

  // --------- AUTH FREELANCER ZONE
  public getMyOffersToAProject(id: number): Observable<any> {
    return this.http.get(`/offers/freelancers/${id}/myProfiles`, {Authorization: this._userService.token});
  }

  public create(offer: Offer): Observable<any> {
    return this.http.post('/offers/freelancers', offer, {Authorization: this._userService.token});
  }

  public update(id: number, offer: Offer): Observable<any> {
    return this.http.put(`/offers/freelancers/${id}`, offer, {Authorization: this._userService.token});
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`/offers/freelancers/${id}`, {Authorization: this._userService.token});
  }

  public takeProject(id: number, freelancer_deposit: number): Observable<any> {
    return this.http.put(`/offers/freelancers/${id}/take`, {freelancer_deposit}, {Authorization: this._userService.token});
    // .pipe( // now implemented with a websocket listener
    //   map((resp)=>{
    //     if(resp.ok){
    //       this._userService.user.balance = resp.data.new_user_balance;
    //       this._userService.saveUser();
    //     }
    //     return {offer: resp.data.offer, job: resp.data.job};
    //   })
    // );
  }

  public refuseProject(id: number): Observable<any> {
    return this.http.put(`/offers/freelancers/${id}/refuse`, {}, {Authorization: this._userService.token});
  }

  // --------- AUTH COMPANY ZONE
  public getMyProjectOffers(id: number): Observable<any> {
    return this.http.get(`/offers/companies/${id}`, {Authorization: this._userService.token});
  }

  public acceptAnOfferToMyProject(id: number, company_deposit: number): Observable<any> {
    return this.http.put(`/offers/companies/${id}/accept`, {company_deposit}, {Authorization: this._userService.token});
    // .pipe( // now implemented with a websocket listener
    //   map((resp)=>{
    //     if(resp.ok){
    //       this._userService.user.balance = resp.data.new_user_balance;
    //       this._userService.saveUser();
    //     }
    //     return resp.data.offer;
    //   })
    // );
  }

  public cancelAnOfferToMyProject(id: number, company_deposit: number): Observable<any> {
    return this.http.put(`/offers/companies/${id}/cancel`, {company_deposit}, {Authorization: this._userService.token});
    // .pipe( // now implemented with a websocket listener
    //   map((resp)=>{
    //     if(resp.ok){
    //       this._userService.user.balance = resp.data.new_user_balance;
    //       this._userService.saveUser();
    //     }
    //     return resp.data.offer;
    //   })
    // );
  }
}
