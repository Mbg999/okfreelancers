import { Component, Output, EventEmitter, Input } from '@angular/core';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Offer } from 'src/app/interfaces/offer';

@Component({
  selector: 'app-in-progress-offer',
  templateUrl: './in-progress-offer.component.html',
  styleUrls: ['./in-progress-offer.component.css']
})
export class InProgressOfferComponent {

  @Input('offer') public offer: Offer;
  @Input('errHours') public errHours: string;
  @Output('markAsFinished') public markAsFinished = new EventEmitter<boolean>();
  @Output('cancelJob') public cancelJob = new EventEmitter<boolean>();

  constructor(public _multilangService: MultilangService) { }

}
