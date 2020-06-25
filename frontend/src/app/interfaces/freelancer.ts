import { SkillSelect } from './skill-select';
import { Portfolio } from './portfolio';
import { Offer } from './offer';
import { Job } from './job';
import { Project } from './project';

export interface Freelancer {
    id?: number;
    user_id?: number;
    email?: string;
    category_id?: number;
    category_name?: string;
    title?: string;
    description?: string;
    years_exp?: string;
    approx_fee?: number;
    advertisable?: boolean;
    picture?: string;
    portfolio_type?: string;
    portfolio?: Portfolio[];
    skills?: SkillSelect[];
    addSkills?: number[];
    offer?: Offer;
    job?: Job;
    title_color?: string;
    text_color?: string;
    background_color?: string;
    rate_average?: number;
    rate_count?: number;
    pending_offers_projects?: Project[];
    in_progress_offers_projects?: Project[];
    ban?: boolean;
    ban_reason?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}
