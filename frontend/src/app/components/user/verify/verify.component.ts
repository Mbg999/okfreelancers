import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICIOS
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  // feedback
  public ok: boolean;
  public msg: string;
  public countdown: number;

  constructor(private _userService: UserService,
    private _dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private _errorService: ErrorService) { }

    /**
     * on init, it sends a verify request with the token in params,
     * after response, it starts an interval of 5 seconds to redirect to root path
     */
  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      this._userService.verify(params.token)
      .subscribe({
        next: (resp)=>{
          this.ok = resp.ok;
          this.msg = resp.message;
          this.redirection();
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error)){
            this.ok = err.error.ok;
            this.msg = err.error.message;
            this.redirection();
          }
        }
      });
    });
  }

  /**
   * Interval of 5 seconds, after it ends, it redirects to root path
   */
  private redirection(): void {
    this.countdown = 5;
    let interval = setInterval(()=>{
      this.countdown--;

      if(this.countdown < 1){
        clearInterval(interval);
        this.router.navigate(['/']);
      }
    },1000);
  }

}
