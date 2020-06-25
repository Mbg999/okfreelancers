export interface Message {
    id?: number;
    sender_id?: number;
    receiver_id?: number;
    text?: string;
    read?: number;
    created_at?: string;
    failed?: boolean;
    sender_info?: {name: string, surnames: string}
}
