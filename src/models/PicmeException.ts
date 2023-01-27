export class PicmeException extends Error {
    status!: number;
    success!: boolean;
    message!: string;

    constructor(status: number, success: boolean, message: string) {
        super(message);

        if (Error.captureStackTrace) Error.captureStackTrace(this, PicmeException);

        Object.setPrototypeOf(this, PicmeException.prototype);

        this.status = status;
        this.success = success;
        this.message = message;
    }
}
