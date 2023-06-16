export interface AlarmRegisterDTO {
    userId: number;
    endpoint: string;
    keys: keys;
}

interface keys {
    p256dh: string;
    auth: string;
}
