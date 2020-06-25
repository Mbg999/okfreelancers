import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ErrorService } from 'src/app/services/error.service';
import { UserService } from 'src/app/services/user.service';
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-auth-all-freelancers',
  templateUrl: './auth-all-freelancers.component.html',
  styleUrls: ['./auth-all-freelancers.component.css']
})
export class AuthAllFreelancersComponent implements OnInit, OnDestroy {

  public freelancers: Freelancer[];
  private multilang: Subscription;

  constructor(private _freelancerService: FreelancerService,
    private _errorService: ErrorService,
    private _userService: UserService,
    public _multilangService: MultilangService,
    private router: Router) { }

  ngOnInit(): void {
    this.getFreelancerProfiles();
    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getFreelancerProfiles();
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getFreelancerProfiles(): void {
    this._freelancerService.getAllMyFreelancers()
    .subscribe({
      next: (resp)=>{
        this.freelancers = resp.data;
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this.router.navigate(['/MyFreelancerProfiles/create']);
        }
      }
    });
  }

  // GETTERS
  get user(): User {
    return this._userService.user;
  }

}
