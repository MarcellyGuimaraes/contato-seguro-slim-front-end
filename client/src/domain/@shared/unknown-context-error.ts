export class UnknownContextError extends Error {
    constructor() {
        const message = 'Unable to access context. Maybe you are not within the provider?';
        
        super(message);
    }
}
