export class HttpError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string) {
        super(400, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
    }
}