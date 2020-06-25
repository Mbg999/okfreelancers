import { Message } from './message';
import { User } from './user';

export interface Chat {
    user?: User;
    unreads?: number;
    last_message?: Message;
}
