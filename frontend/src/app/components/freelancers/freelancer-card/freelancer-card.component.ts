import { Component, Input } from '@angular/core';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';

@Component({
  selector: 'app-freelancer-card',
  templateUrl: './freelancer-card.component.html',
  styleUrls: ['./freelancer-card.component.css']
})
export class FreelancerCardComponent {

  @Input('freelancer') public freelancer: Freelancer;
  @Input('showTitle') public showTitle: boolean;
  @Input('itsMyProfile') public itsMyProfile: boolean;
  @Input('titleColor') public titleColor: string;
  @Input('textColor') public textColor: string;
  @Input('bgColor') public bgColor: string;

  constructor(public _multilangService: MultilangService){}

}
