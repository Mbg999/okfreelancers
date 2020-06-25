export interface Portfolio {
    /**
     * Id exists for laravel requirements, but it is never send
     */
    id?: number;
    position?: number;
    freelancer_id?: number;
    title?: string;
    description?: string;
    file?: string;
}
