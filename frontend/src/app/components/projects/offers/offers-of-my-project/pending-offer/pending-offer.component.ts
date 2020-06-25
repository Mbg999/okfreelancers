import { Component, Output, EventEmitter, Input } from '@angular/core';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Offer } from 'src/app/interfaces/offer';

@Component({
  selector: 'app-pending-offer',
  templateUrl: './pending-offer.component.html',
  styleUrls: ['./pending-offer.component.css']
})
export class PendingOfferComponent {

  @Input('offer') public offer: Offer;
  @Output('cancelOffer') public cancelOffer = new EventEmitter<boolean>();

  constructor(public _multilangService: MultilangService) { }
}
