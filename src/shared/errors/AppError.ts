class AppError {
    readonly message: string | string[];
    readonly statusCode: number;

    constructor(message: string | string[], statusCode: number) {
        this.message = message;
        this.statusCode = statusCode;
    }
}

export { AppError };
