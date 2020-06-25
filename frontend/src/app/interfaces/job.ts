export interface Job {
    id?: number;
    project_id?: number;
    freelancer_id?: number;
    hours?: number;
    price_hour?: number;
    finished?: string;
    rate?: number;
    assessment?: string;
    created_at?: string;
    updated_at?: string;
    days_passed?: number;
}
