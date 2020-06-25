import { Component, ViewChild, Input, OnInit } from '@angular/core';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// NGX-STRIPE
import { StripeService, StripeCardComponent, Elements, Element as StripeElement, ElementsOptions, ElementOptions, CardDataOptions } from "ngx-stripe";

// NGX-PAYPAL
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';

// INTERFACES
import { User } from 'src/app/interfaces/user';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-my-balance-modal',
  templateUrl: './my-balance-modal.component.html',
  styleUrls: ['./my-balance-modal.component.css']
})
export class MyBalanceModalComponent implements OnInit {
  
  // NGX-STRIPE CONFIG
  public errMsg: string;
  @ViewChild(StripeCardComponent) card: StripeCardComponent;
  public cardOptions: ElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: '40px',
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };
  public elementsOptions: ElementsOptions = {
    locale: 'auto'
  };
  // /NGX-STRIPE CONFIG
  
  // NGX-PAYPAL CONFIG
  public payPalConfig ? : IPayPalConfig;
  
  
  @Input('user') public user: User;
  @Input('itsWithdraw') public itsWithdraw: boolean;
  public amountForm: FormGroup;
  public checkoutDataForm: FormGroup;
  public checkout: boolean;
  public errEmail: string;
  public errAmount: string;
  
  constructor(public activeModal: NgbActiveModal,
    public _multilangService: MultilangService,
    private stripeService: StripeService,
    private _transactionService: TransactionService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private fb: FormBuilder) {
    
  }
  
  ngOnInit(): void {
    this.amountForm = this.fb.group({
      'amount': ['', [
        CustomValidators.required,
        CustomValidators.min(1),
        CustomValidators.max((this.itsWithdraw) ? this.user.balance : 99999999.99-this.user.balance),
        CustomValidators.pattern(/^\d*(?:[.,]\d{1,2})?$/) // max 2 decimal numbers
      ]]
    });

    this._dialogService.iconless(this._multilangService.translate('dialog.payment_test'));
    // paypal sandbox: sb-bsxdz1695246@personal.example.com / Usuario0?
    if(!this.itsWithdraw) {
      this.initConfig();
    } else {
      this.checkoutDataForm = this.fb.group({
        'email': ['', [
          CustomValidators.required,
          CustomValidators.email
        ]]
      });
    }
  }
  
  public pay(): void {
    this.errMsg = undefined;
    this._dialogService.loading();
    this.stripeService
    .createToken(this.card.getCard(), this.getUserOptions())
    .subscribe(result => {
      if (result.token) {
        // Use the token to create a charge and a customer
        // https://stripe.com/docs/charges
        this.stripeService.createPaymentMethod(result.token.type,this.card.getCard())
        .subscribe((result2)=>{
          this._transactionService.payWithStripe(result.token, result2.paymentMethod, this.amount.value)
          .subscribe({
            next: (resp)=>{
              this._dialogService.close();
              this._dialogService.success(
                this._multilangService.translate('user.correct_payment', {amount: this.amount.value})
                ).then(()=>{
                  this.activeModal.close(resp.data);
                });
            },
            error: (err)=>{
              this._dialogService.close();
              this._errorService.handeError(err.error);
            }
          });
        });
      } else {
        this._dialogService.close();
        // Error creating the token
        this.errMsg = result.error.message;
      }
    });
  }
    
  private getUserOptions(): CardDataOptions {
    let options: CardDataOptions =  {
      name: `${this.user.name} ${this.user.surnames}`,
      currency: 'eur'
    };
    
    if(this.user.address){
      options.address_city = this.user.address;
      options.address_state = this.user.region;
      options.address_country = this.user.country;
    }
    
    if(this.user.zip) options.address_zip = this.user.zip;
    
    return options;
  }

  public withdraw(): void {
    this._dialogService.loading();
    this._transactionService.withdrawWithPaypal(this.email.value, this.amount.value)
    .subscribe({
      next: (resp)=>{
        this._dialogService.close();
        this._dialogService.success(
          this._multilangService.translate('user.correct_withdrawn', {amount: this.amount.value})
          ).then(()=>{
            this.activeModal.close(resp.data);
          });
      },
      error: (err)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err.error)){
          if(err.error.errors.email){
            this.errEmail = err.error.errors.email;
          }
          if(err.error.errors.amount){
            this.checkout = false;
            this.errAmount = err.error.errors.amount;
          }
        }
      }
    });
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AfC68J2FCDIN3zW4KETP6PHjya781sL49sfsOOITx4_YQ46PcM4AyIvdhbUTPc_tZguPXcvAZURyLXVb',
      
      createOrderOnClient: (data) => {
        return <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'EUR',
              value: this.amount.value,
              breakdown: {
                item_total: {
                  currency_code: 'EUR',
                  value: this.amount.value
                }
              }
            },
            items: [{
              name: this._multilangService.translate('user.user_balance_description'),
              quantity: '1',
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: 'EUR',
                value: this.amount.value,
              },
            }]
          }]
        }
      },
      advanced: {
        commit: 'true',
        extraQueryParams: [{
          // https://developer.paypal.com/docs/checkout/reference/customize-sdk/#disable-funding
          // card button is not working properly, paypal sandbox bug
          name: 'disable-funding',
          value: 'card,sofort'
        }]
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        // console.log('onApprove - transaction was approved, but not authorized', data, actions);
        // actions.order.get().then(details => {
        //   console.log('onApprove - you can get full order details inside onApprove: ', details);
        // });
        this._dialogService.loading();
      },
      onClientAuthorization: (data) => {
        // console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        this._transactionService.payWithPayPal(this.amount.value, data.purchase_units[0].description)
        .subscribe({
          next: (resp)=>{
            this._dialogService.close();
            this._dialogService.success(
              this._multilangService.translate('user.correct_payment', {amount: this.amount.value})
              ).then(()=>{
                this.activeModal.close(resp.data);
              });
          },
          error: (err)=>{
            this._dialogService.close();
            this._errorService.handeError(err.error);
          }
        });
      },
      onCancel: (data, actions) => {
        // console.log('OnCancel', data, actions);
        this._dialogService.close();
      },
      onError: err => {
        // console.log('OnError', err);
        this._dialogService.close();
        this._errorService.handeError(err);
      },
      onClick: (data, actions) => {
        // console.log('onClick', data, actions);
      },
    };
  }
    
  // GETTERS
  
  get amount(): AbstractControl {
    return this.amountForm.get('amount');
  }

  get email(): AbstractControl {
    return this.checkoutDataForm.get('email');
  }
    
}
  