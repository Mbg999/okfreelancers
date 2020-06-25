import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// SERVICES
import { UserService } from './user.service';
import { HttpService } from './http.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

    // --------- AUTH FREELANCER ZONE
    public updateHours(id: number, hours: number): Observable<any> {
      return this.http.put(`/jobs/freelancers/${id}/hours`, {hours}, {Authorization: this._userService.token});
    }

    public cancelJobAsFreelancer(offer_id: number, job_id: number): Observable<any> {
      return this.http.put(`/jobs/freelancers/${offer_id}/${job_id}/cancel`, {}, {Authorization: this._userService.token});
    }

    // --------- AUTH COMPANY ZONE
    public markAsFinished(offer_id: number, job_id: number, hours: number): Observable<any> {
      return this.http.put(`/jobs/companies/${offer_id}/${job_id}/finish`, {hours}, {Authorization: this._userService.token});
      // .pipe( // now implemented with a websocket listener
      //   map((resp)=>{
      //     if(resp.ok){
      //       this._userService.user.balance = resp.data.new_user_balance;
      //       this._userService.saveUser();
      //     }
      //     return resp.data.job;
      //   })
      // );
    }

    public cancelJobAsCompany(offer_id: number, job_id: number): Observable<any> {
      return this.http.put(`/jobs/companies/${offer_id}/${job_id}/cancel`, {}, {Authorization: this._userService.token});
    }

    public rateAFinishedJob(id: number, rate: {rate: number, assessment: string}): Observable<any> {
      return this.http.put(`/jobs/companies/${id}/rate`, rate, {Authorization: this._userService.token});
    }
}
