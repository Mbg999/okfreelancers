export interface Category {
    id?: number;
    father_id?: number;
    name?: string;
    name_es?: string;
    name_en?: string;
    description?: string;
    description_es?: string;
    description_en?: string;
    image?: any; // can be File or string
    title_color?: string;
    text_color?: string;
    background_color?: string;
    portfolio_type?: string;
    freelancers_count?: number;
    categories_count?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}
