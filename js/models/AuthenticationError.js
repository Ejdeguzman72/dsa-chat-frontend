export class AuthenticationError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = "AuthenticationError";
    }
}
