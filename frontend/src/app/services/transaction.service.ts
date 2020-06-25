import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';

// INTERFACES
import { Token } from 'ngx-stripe';
import { PaymentMethod } from 'ngx-stripe/lib/interfaces/payment-intent';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

  // --------- AUTH ZONE
  public getMyTransactions(): Observable<any>{
    return this.http.get('/transactions/myTransactions', {Authorization: this._userService.token});
  }

  public payWithStripe(stripeToken: Token, paymentMethod: PaymentMethod, amount: number): Observable<any>{
    return this.http.post('/transactions/myTransactions/addBalance/stripe', {stripeToken, paymentMethod, amount}, {Authorization: this._userService.token});
    // .pipe( // now implemented with a websocket listener
    //   map((resp)=>{
    //     if(resp.ok){
    //       this._userService.user.balance += amount;
    //       this._userService.setUser(this._userService.user);
    //     }
    //     return resp;
    //   })
    // );
  }

  public payWithPayPal(amount: number, description: string): Observable<any>{
    return this.http.post('/transactions/myTransactions/addBalance/paypal', {amount, description}, {Authorization: this._userService.token});
    // .pipe( // now implemented with a websocket listener
    //   map((resp)=>{
    //     if(resp.ok){
    //       this._userService.user.balance += amount;
    //       this._userService.setUser(this._userService.user);
    //     }
    //     return resp;
    //   })
    // );
  }

  public withdrawWithPaypal(email: string, amount: number): Observable<any>{
    return this.http.post('/transactions/myTransactions/withdrawBalance/paypal', {email, amount}, {Authorization: this._userService.token});
    // .pipe( // now implemented with a websocket listener
    //   map((resp)=>{
    //     if(resp.ok){
    //       this._userService.user.balance -= amount;
    //       this._userService.setUser(this._userService.user);
    //     }
    //     return resp;
    //   })
    // );
  }

  public generatePDF(): Observable<any>{
    return this.http.get('/transactions/myTransactions/generatePDF', {Authorization: this._userService.token}, 'blob');
  }

  // --------- ADMIN ZONE
  public getTransactionsAsAdmin(id: number): Observable<any>{
    return this.http.get(`/transactions/admin/${id}/all`, {Authorization: this._userService.token});
  }
}
