export interface Company {
    id?: number;
    user_id?: number;
    name?: string;
    description?: string;
    logo?: any; // can be File or string
    address?: string;
    address_description?: string;
    zip?: string;
    town?: string;
    region?: string;
    country?: string;
    web?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    email?: string;
    ban?: boolean;
    ban_reason?: string;
}
