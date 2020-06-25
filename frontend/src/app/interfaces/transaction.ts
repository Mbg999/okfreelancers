export interface Transaction {
    id: number;
    user_id?: number;
    amount: number;
    pay: string;
    description: string;
    created_at: string;
}
