import { Job } from './job';

export interface Offer {
    id?: number;
    project_id?: number;
    freelancer_id?: number;
    price?: number;
    approx_hours?: number;
    approx_term?: number;
    message?: string;
    company_deposit?: number;
    freelancer_deposit?: number;
    created_at?: string;
    updated_at?: string;
    freelancer_title?: string;
    freelancer_picture?: string;
    category_name?: string;
    job?: Job;
}
