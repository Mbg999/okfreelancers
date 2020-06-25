import { Offer } from './offer';

export interface OfferStatusCompany {
    available_offers: Offer[];
    pending_offers: Offer[];
    in_progress_offers: Offer[];
    finished_offers: Offer[];
}