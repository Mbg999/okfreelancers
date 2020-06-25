import { Role } from './role';

export interface User {
    id?: number;
    email?: string;
    name?: string;
    surnames?: string;
    born_date?: string;
    phone?: string;
    picture?: string;
    balance?: any; // this will be received as number, and get piped to string
    address?: string;
    address_description?: string;
    zip?: string;
    town?: string;
    region?: string;
    country?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    roles?: Role[];
    activeRole?: number;
    ban?: boolean;
    ban_reason?: string;
}
