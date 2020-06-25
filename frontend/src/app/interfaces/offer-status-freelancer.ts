import { Offer } from './offer';

export interface OfferStatusFreelancer {
    pending_offers: Offer[];
    in_progress_offers: Offer[];
}
