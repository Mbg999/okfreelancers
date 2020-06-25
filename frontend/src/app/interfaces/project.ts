import { CategorySelect } from './category-select';
import { SkillSelect } from './skill-select';
import { Job } from './job';

export interface Project {
    id?: number;
    company_id?: number;
    company_name?: string;
    company_logo?: string;
    title?: string;
    description?: string;
    advertisable?: any; // boolean or number
    finished?: string;
    budget?: number;
    categories?: CategorySelect[];
    addCategories?: number[];
    skills?: SkillSelect[];
    addSkills?: number[];
    user_id?: number;
    email?: string;
    ban?: boolean;
    job?: Job;
    ban_reason?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}
