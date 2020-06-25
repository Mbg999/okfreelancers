import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';

// INTERFACES
import { Role } from '../interfaces/role';


@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

  // --------- ALL ZONE
  public getACompany(name: string): Observable<any> {
    return this.http.get(`/companies/${name}`);
  }

  public getAUserCompany(email: string): Observable<any> {
    return this.http.get(`/companies/user/${email}`);
  }

  // --------- AUTH ZONE
  public getMyCompany(): Observable<any> {
    return this.http.get('/companies/myCompany/get', {Authorization: this._userService.token});
  }

  /**
   * Create my company
   * 
   * @param company FormData
   */
  public createAsAuth(company: FormData): Observable<any> {
    return this.http.post('/companies/myCompany', company, {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(resp.ok){
          this._userService.addRole({id: 1, name: 'company'});
        }
        return resp;
      })
    );
  }

  /**
   * Update my company
   * 
   * @param company FormData
   */
  public updateAsAuth(company: FormData): Observable<any> {
    return this.http.post('/companies/myCompany/update', company, {Authorization: this._userService.token});
  }

  public deactivateAsAuth(): Observable<any> {
    return this.http.delete('/companies/myCompany/deactivate', {Authorization: this._userService.token});
  }

  public activateAsAuth(): Observable<any> {
    return this.http.get('/companies/myCompany/activate', {Authorization: this._userService.token});
  }

  public deleteAsAuth(): Observable<any> {
    return this.http.delete('/companies/myCompany', {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(resp.ok){
          this._userService.removeRole(1);
        }
        return resp;
      })
    );
  }

  // --------- ADMIN ZONE
  /**
   * retrieve all the companies with admin privileges
   */
  public getCompaniesAsAdmin(): Observable<any> {
    return this.http.get('/companies/admin/all', {Authorization: this._userService.token});    
  }

  /**
   * Retrieve the company profile of a user as admin
   * 
   * @param userId number
   */
  public getCompanyOfAUserAsAdmin(userId: number): Observable<any> {
    return this.http.get(`/companies/admin/user/${userId}`, {Authorization: this._userService.token});
  }

  /**
   * Retrieve a company as admin
   * 
   * @param id number
   */
  public getACompanyAsAdmin(id: number): Observable<any> {
    return this.http.get(`/companies/admin/${id}`, {Authorization: this._userService.token}); 
  }

  /**
   * Create a company
   * 
   * @param company FormData
   */
  public createAsAdmin(company: FormData): Observable<any> {
    return this.http.post('/companies/admin', company, {Authorization: this._userService.token});
  }

  /**
   * Update a company
   * 
   * @param id number
   * @param company FormData
   */
  public updateAsAdmin(id: number, company: FormData){
    return this.http.post(`/companies/admin/${id}/update`, company, {Authorization: this._userService.token});
  }

  /**
   * ban a company
   * SoftDeleted
   * 
   * @param id number
   */
  public ban(id: number, ban_reason: string): Observable<any> {
    return this.http.put(`/companies/admin/${id}/ban`, {ban_reason}, {Authorization: this._userService.token});
  }

  /**
   * rehabilitate a company
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activateAsAdmin(id: number): Observable<any> {
    return this.http.get(`/companies/admin/${id}/activate`, {Authorization: this._userService.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * @param id number
   */
  public deleteAsAdmin(id: number): Observable<any> {
    return this.http.delete(`/companies/admin/${id}`, {Authorization: this._userService.token});
  }
}
