import { Injectable } from '@angular/core';

// SWEETALERT
import Swal, { SweetAlertResult } from 'sweetalert2';

// SERVICES
import { MultilangService } from './multilang.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private _multilangService: MultilangService){}

  public loading(): void {
    Swal.fire({
      title: this._multilangService.translate("dialog.loading"),
      text: this._multilangService.translate("dialog.wait"),
      imageUrl: "assets/images/loading_1.gif",
      imageWidth: 300,
      showConfirmButton: false,
      allowOutsideClick: false
    });
  }

  public iconless(textHtml: string, title: string = null,
    confirmButtonText: string = this._multilangService.translate('dialog.ok'),
    showCancelButton: boolean = false, cancelButtonText = null,
    confirmButtonColor: string = '#00b5d7', cancelButtonColor:string='#dc3545'): Promise<SweetAlertResult> {

    return Swal.fire({
        title,
        html: textHtml,
        confirmButtonText,
        confirmButtonColor,
        showCancelButton,
        cancelButtonText,
        cancelButtonColor
    });
  }

  public success(text: string, title: string = null): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: this._multilangService.translate('dialog.ok'),
      confirmButtonColor: '#00b5d7'
    });
  }

  public error(text: string, title: string = null,
    confirmButtonText: string = this._multilangService.translate('dialog.ok'), showCancelButton: boolean = false,
    cancelButtonText: string = this._multilangService.translate('miscellaneous.cancel')): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText,
      confirmButtonColor: '#00b5d7',
      showCancelButton,
      cancelButtonText
    })
  }

  public connectionError(): void {
    Swal.fire({
      title: this._multilangService.translate('dialog.connection_error'),
      text: this._multilangService.translate('dialog.verify_connection'),
      icon: 'error',
      confirmButtonText: this._multilangService.translate('dialog.ok'),
      confirmButtonColor: '#00b5d7'
    });
  }

  public danger(title: string, html: string, confirmButtonText: string): Promise<SweetAlertResult> {
    // const SwalDelete = Swal.mixin({ // override default Swal classes
    //   customClass: {
    //     confirmButton: 'btn btn-danger mx-2 p2',
    //     cancelButton: 'btn btn-primary mx-2 p2'
    //   },
    //   buttonsStyling: false
    // })
    return Swal.fire({ // confirm dialog
      title,
      html,
      confirmButtonText,
      confirmButtonColor: '#dc3545',
      showCancelButton: true,
      cancelButtonText: this._multilangService.translate('miscellaneous.cancel'),
      cancelButtonColor: '#00b5d7'
    });
  }

  public inputEmail(): Promise<SweetAlertResult> {
    return Swal.fire({
      title: this._multilangService.translate('user.paypal_email'),
      input: 'email',
      confirmButtonColor: '#00b5d7',
      inputAttributes: {
        autocapitalize: 'off',
        placeholder: this._multilangService.translate('user.email')
      },
      inputValidator: (value) => {
        if(value) {
          // https://stackoverflow.com/a/201378/9764641
          var format = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
          if(!format.test(value)){   
            return this._multilangService.translate('validators.email');
          }
        
        } else {
          return this._multilangService.translate('validators.required');
        }
      }
    });
  }

  public close(): void {
    Swal.close();
  }

}
