import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';

@Injectable({
  providedIn: 'root'
})
export class FreelancerService {

  constructor(private http: HttpService,
    private _userService: UserService) { }
  
  // --------- ALL ZONE
  public getAFreelancer(id: number): Observable<any> {
    return this.http.get(`/freelancers/${id}`);
  }

  public getAllFreelancersFromAUser(email: string): Observable<any> {
    return this.http.get(`/freelancers/user/${email}`);
  }

  public getFreelancersFromACategoryPaginated(name: string, limit: number, page: number=1): Observable<any> {
    return this.http.get(`/freelancers/category/${name}/${limit}?page=${page}`);
  }

  public getFreelancersFromASkillPaginated(name: string, limit: number, page: number=1): Observable<any> {
    return this.http.get(`/freelancers/skill/${name}/${limit}?page=${page}`);
  }

  public getTopLatest(limit: number, page: number=1): Observable<any> {
    return this.http.get(`/freelancers/top/${limit}/latest?page=${page}`);
  }
   
  // --------- AUTH ZONE
  public getAllMyFreelancers(): Observable<any> {
    return this.http.get('/freelancers/myProfiles/all', {Authorization: this._userService.token});
  }

  public getOneOfMyFreelancers(id: number): Observable<any> {
    return this.http.get(`/freelancers/myProfiles/${id}/get`, {Authorization: this._userService.token});
  }

  /**
   * Create a freelancer profile
   * 
   * @param freelancer FormData
   */
  public createAsAuth(freelancer: FormData): Observable<any> {
    return this.http.post('/freelancers/myProfiles', freelancer, {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(resp.ok && resp.addRole){
          this._userService.addRole({id: 2, name: 'freelancer'});
        }
        return resp;
      })
    );
  }

  /**
   * Update my company
   * 
   * @param id number
   * @param freelancer FormData
   */
  public updateAsAuth(id: number, freelancer: FormData): Observable<any> {
    return this.http.post(`/freelancers/myProfiles/${id}/update`, freelancer, {Authorization: this._userService.token});
  }

  public deactivateAsAuth(id: number): Observable<any> {
    return this.http.delete(`/freelancers/myProfiles/${id}/deactivate`, {Authorization: this._userService.token});
  }

  public activateAsAuth(id: number): Observable<any> {
    return this.http.get(`/freelancers/myProfiles/${id}/activate`, {Authorization: this._userService.token});
  }

  public deleteAsAuth(id: number): Observable<any> {
    return this.http.delete(`/freelancers/myProfiles/${id}`, {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(resp.ok && resp.removeRole){
          this._userService.removeRole(2);
        }
        return resp;
      })
    );
  }


  // --------- ADMIN ZONE
  /**
    * retrieve all the freelancers with admin privileges
    */
  public getFreelancersAsAdmin(): Observable<any> {
    return this.http.get('/freelancers/admin/all', {Authorization: this._userService.token});    
  }

  /**
   * retrieve a freelancer profile data as admin
   * 
   * @param id number
   */
  public getAFreelancerAsAdmin(id: number): Observable<any> {
    return this.http.get(`/freelancers/admin/${id}`, {Authorization: this._userService.token}); 
  }

  /**
   * Retrieve all the freelancer profiles of a user
   * 
   * @param userId number
   */
  public getFreelancersOfAUserAsAdmin(userId: number): Observable<any> {
    return this.http.get(`/freelancers/admin/user/${userId}`, {Authorization: this._userService.token});
  }

  /**
   * Create a freelancer profile
   * 
   * @param freelancer FormData
   */
  public createAsAdmin(freelancer: FormData): Observable<any> {
    return this.http.post('/freelancers/admin', freelancer, {Authorization: this._userService.token});
  }

  /**
   * Update a freelancer profile
   * 
   * @param id number
   * @param freelancer FormData
   */
  public updateAsAdmin(id: number, freelancer: FormData): Observable<any> {
    return this.http.post(`/freelancers/admin/${id}/update`, freelancer, {Authorization: this._userService.token});
  }

  /**
   * Ban a freelancer profile
   * SoftDeleted
   * 
   * @param id number
   */
  public ban(id: number, ban_reason: string): Observable<any> {
    return this.http.put(`/freelancers/admin/${id}/ban`, {ban_reason}, {Authorization: this._userService.token});
  }

  /**
   * Rehabilitate a freelancer profile
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activateAsAdmin(id: number): Observable<any> {
    return this.http.get(`/freelancers/admin/${id}/activate`, {Authorization: this._userService.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * @param id number
   */
  public deleteAsAdmin(id: number): Observable<any> {
    return this.http.delete(`/freelancers/admin/${id}`, {Authorization: this._userService.token});
  }



  // --------- PORTFOLIO ZONE ---------

  // --------- AUTH ZONE
  public updatePortfolioAsAuth(id: number, portfolio: FormData[]): Observable<any> {
    return this.http.post(`/freelancers/myProfiles/${id}/update/portfolio`, portfolio, {Authorization: this._userService.token});
  }

  // --------- ADMIN ZONE
  public getAPortfolioAsAdmin(id: number): Observable<any> {
    return this.http.get(`/freelancers/admin/${id}/portfolio`, {Authorization: this._userService.token});
  }

  public updatePortfolioAsAdmin(id: number, portfolio: FormData[]): Observable<any> {
    return this.http.post(`/freelancers/admin/${id}/update/portfolio`, portfolio, {Authorization: this._userService.token});
  }
}
