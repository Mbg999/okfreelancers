import { Component, Output, EventEmitter, Input } from '@angular/core';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Offer } from 'src/app/interfaces/offer';


@Component({
  selector: 'app-available-offer',
  templateUrl: './available-offer.component.html',
  styleUrls: ['./available-offer.component.css']
})
export class AvailableOfferComponent {

  @Input('offer') public offer: Offer;
  @Output('acceptOffer') public acceptOffer = new EventEmitter<boolean>();

  constructor(public _multilangService: MultilangService) { }

}
