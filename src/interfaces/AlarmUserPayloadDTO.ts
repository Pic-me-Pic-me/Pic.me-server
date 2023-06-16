export interface AlarmUserPayloadDTO {
    endpoint: string;
    keys: keys;
}

interface keys {
    p256dh: string;
    auth: string;
}
