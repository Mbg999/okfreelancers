import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// UTILS
import { MyUtils } from '../classes/my-utils';

// INTERFACES
import { User } from '../interfaces/user';
import { Role } from '../interfaces/role';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public user: User;
  public token: string;
  public remember: boolean; // remember the user session
  public availableMissingRoles: Role[];

  constructor(private http: HttpService) {
    this.setAvailableMissingRoles();
  }
  
  // --------- ALL ZONE
  public getUserByEmail(email: string): Observable<any>{
    return this.http.get(`/users/email/${email}`);
  }

  // --------- AUTH ZONE
  public login(email:string, password:string, remember: boolean=null): Observable<any> {
    return this.http.post('/auth/login', {email, password})
    .pipe(
      map((data:any)=>{
        if(data.ok){
          if(remember) this.remember = remember;
          this.saveAuthData(data.data);
        }
      })
    );
  }

  public register(user:any): Observable<any> {
    return this.http.post('/auth/register', user);
  }

  public logout(): Observable<any> {
    return this.http.get('/auth/logout', {Authorization: this.token})
    .pipe(
      map((resp)=>{
        this.removeAuthData();
        this.setAvailableMissingRoles(); // for the next login
        return resp;
      })
    );
  }

  public refreshUserData(): Observable<any> {
    return this.http.get('/auth/me', {Authorization: this.token})
    .pipe(
      map((resp)=>{
        if(resp.ok){
          this.setUser(resp.data);
        }
        return resp;
      })
    );
  }

  public addRole(role: Role): void {
    this.user.roles.push(role);
    this.user.roles.sort((a,b)=>a.name.localeCompare(b.name));
    this.user.activeRole = role.id;
    this.setAvailableMissingRoles();
    this.determineMissingRoles();
    this.saveUser();
  }

  public removeRole(id: number): void {
    this.user.roles.map((role, i)=>{
      if(role.id == id){
        this.user.roles.splice(i,1);
        if(this.user.activeRole == id){
          this.user.activeRole = (this.user.roles[0]) ? this.user.roles[0].id : 3;
        }
      }
    });
    this.setAvailableMissingRoles();
    this.determineMissingRoles();
    this.saveUser();
  }

  // --------- USER VERIFY ZONE
  public resendVerifyEmail(email:string): Observable<any> {
    return this.http.post(`/auth/verify/resend`, {email});
  }

  public verify(token:string): Observable<any> {
    return this.http.get(`/auth/verify/${token}`);
  }

  // --------- PASSWORD RESET ZONE
  public sendPasswordReset(email:string): Observable<any> {
    return this.http.post('/password/reset', {email});
  }

  public resetPassword(email:string, token:string,
    password:string, password_confirmation:string): Observable<any> {
    return this.http.put('/password/reset',{
      email,
      token,
      password,
      password_confirmation
    });
  }

  // --------- AUTH USER ZONE
  /**
   * Uploads a new picture for the auth user,
   * it saves the new image into the user object
   * 
   * @param picture File
   */
  public uploadPicture(picture:File): Observable<any> {
    let data: FormData = new FormData();
    data.append('picture', picture, picture.name);
    return this.http.post('/users/picture', data, {Authorization: this.token}) // the browser places the Content-Type: multipart/form-data by default
    .pipe(
      map((data:any)=>{
        if(data.ok){
          this.user.picture = data.picture;
          this.saveUser();
        }
        return data;
      })
    );
  }

  /**
   * Updates the data for the auth user,
   * it saves the updated user into the user object
   * 
   * @param data any
   */
  public update(data: User): Observable<any> {
    return this.http.put('/users', data, {Authorization: this.token})
    .pipe(
      map((resp:any)=>{
        this.setUser(resp.data);
        return resp;
      })
    );
  }

  /**
   * SoftDeleted
   * 
   */
  public deactivateAsAuth(): Observable<any> {
    return this.http.delete(`/users/deactivate`, {Authorization: this.token})
    .pipe(
      map((resp)=>{
        this.removeAuthData();
        return resp;
      })
    );
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   */
  public deleteAsAuth(emailForPaypalPayment: string): Observable<any> {
    return this.http.delete(`/users/${emailForPaypalPayment}`, {Authorization: this.token})
    .pipe(
      map((resp)=>{
        this.removeAuthData();
        return resp;
      })
    );;
  }

  public checkForAuthUser(): boolean {
    if(localStorage.getItem('token') && localStorage.getItem('user')){
      this.token = localStorage.getItem('token');
      this.user = JSON.parse(localStorage.getItem('user'));
      this.setUser(this.user);
      this.remember = true;
      return true;
    } else if(sessionStorage.getItem('token') && sessionStorage.getItem('user')) {
      this.token = sessionStorage.getItem('token');
      this.user = JSON.parse(sessionStorage.getItem('user'));
      return true;
    }
    return false;
  }

  private saveAuthData(data:any): void {
    this.token = `${data.token_type} ${data.token}`;

    if(this.remember){
      localStorage.setItem('token', this.token);
    } else {
      sessionStorage.setItem('token', this.token);
    }
    
    this.setUser(data.user);
  }

  public setUser(user:User): void {
     if(this.user?.activeRole){
       let activeRole = user.roles.find((role)=>role.id == this.user.activeRole);
       user.activeRole = (activeRole) ? activeRole.id : (user.roles.length > 0) ? user.roles[0].id : 3;
     } else {
      // determinate the current role, this is used for the navbar
      user.activeRole = (user.roles.length > 0) ? user.roles[0].id : 3; 
      // 42 == administrator
      // 1 == company
      // 2 == freelancer
      // 3 == starter
    }
    
    this.user = user;
    this.determineMissingRoles();
    this.saveUser();
  }

  public saveUser(): void {
    if(this.remember){
      localStorage.setItem('user', JSON.stringify(this.user));
    } else {
      sessionStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  public removeAuthData(): void {
    this.token = null;
    this.user = null;
    this.remember = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
  }

  public setAvailableMissingRoles(): void {
    this.availableMissingRoles = [
      {id: 1, name: 'company', createLink: '/MyCompany/create'},
      {id: 2, name: 'freelancer', createLink: '/MyFreelancerProfiles/create'}
    ];
  }

  public determineMissingRoles(): void {
    this.availableMissingRoles = this.missingRoles(this.availableMissingRoles);
  }

  /**
   * Returns the roles that the user does not have
   * 
   * @param roles Role[]
   * @param user User
   */
  public missingRoles(roles: Role[], roles2: Role[]=this.user.roles): Role[]{
    return roles.filter(MyUtils.comparer(roles2));
  }

  // --------- ADMIN ZONE
  public getAllUsers(): Observable<any> {
    return this.http.get('/users/admin/all', {Authorization: this.token});
  }

  public searchByEmailAsAdmin(search: string){
    return this.http.get(`/users/admin/email/${search}`, {Authorization: this.token});
  }

  public getAnUserAsAdmin(id:number): Observable<any> {
    return this.http.get(`/users/admin/${id}`, {Authorization: this.token});
  }

  /**
   * ban a user profile
   * SoftDeleted
   * 
   * @param id number
   */
  public ban(id: number, ban_reason: string): Observable<any> {
    return this.http.put(`/users/admin/${id}/ban`, {ban_reason}, {Authorization: this.token});
  }

  /**
   * rehabilitate a user profile
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activateAsAdmin(id: number): Observable<any> {
    return this.http.get(`/users/admin/${id}/activate`, {Authorization: this.token});
  }

  /**
   * Update an user as admin
   * 
   * @param category Category
   */
  public updateAsAdmin(id:number, data:any): Observable<any> {
    return this.http.put(`/users/admin/${id}`, data, {Authorization: this.token})
    .pipe(
      map((resp)=>{
        if(resp.ok && resp.data.id == this.user.id){
          this.setUser(resp.data);
        }
        return resp;
      })
    );
  }

  /**
   * uploads a new picture for any user
   * 
   * @param id number
   * @param picture File
   */
  public uploadPictureAsAdmin(id:number, picture:File): Observable<any> {
    let data: FormData = new FormData();
    data.append('picture', picture, picture.name);
    return this.http.post(`/users/admin/${id}/picture`, data, {Authorization: this.token}) // the browser places the Content-Type: multipart/form-data by default
    .pipe(
      map((resp)=>{
        if(resp.ok && id == this.user.id){
          this.user.picture = resp.picture;
        }
        return resp;
      })
    );
  }

  /**
   * add any role to any user
   * 
   * @param userId number
   * @param roleId nummber
   */
  public addRoleAsAdmin(userId:number, roleId:number): Observable<any> {
    return this.http.put(`/users/admin/${userId}/role/${roleId}`, null, {Authorization: this.token});
  }

  /**
   * remove any role to any user
   * 
   * @param userId number
   * @param roleId number
   */
  public removeRoleAsAdmin(userId:number, roleId:number): Observable<any> {
    return this.http.delete(`/users/admin/${userId}/role/${roleId}`, {Authorization: this.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * 
   * @param id number
   */
  public deleteAsAdmin(id: number, emailForPaypalPayment: string): Observable<any> {
    return this.http.delete(`/users/admin/${id}/${emailForPaypalPayment}`, {Authorization: this.token});
  }
}
