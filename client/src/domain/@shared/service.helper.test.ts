import { describe, expect, it, vi } from 'vitest';

import { handleServiceError, hasServiceError } from './service.helper';
import type { Service } from './service.type';

describe('hasServiceError', () => {
    it('returns true when response is an Error instance', () => {
        const response = new Error('network failure');

        expect(hasServiceError(response)).toBe(true);
    });

    it('returns true when response has an "error" property (ServerException)', () => {
        const response: Service.ServerException = {
            statusCode: 422,
            error: { type: 'VALIDATION_ERROR', description: 'Invalid input' },
        };

        expect(hasServiceError(response)).toBe(true);
    });

    it('returns false when response is a valid DefaultResponse', () => {
        const response: Service.DefaultResponse<{ companies: [] }> = {
            statusCode: 200,
            data: { companies: [] },
        };

        expect(hasServiceError(response)).toBe(false);
    });
});

describe('handleServiceError', () => {
    const makeApp = () => ({
        notification: { error: vi.fn() },
        message: { error: vi.fn() },
        modal: { error: vi.fn() },
    });

    it('calls notification.error with error.message when response is an Error', () => {
        const app = makeApp();
        const response = new Error('something broke');

        handleServiceError(app, response);

        expect(app.notification.error).toHaveBeenCalledWith({
            message: 'Algo deu errado!',
            description: 'something broke',
        });
    });

    it('calls notification.error with ServerException description by default', () => {
        const app = makeApp();
        const response: Service.ServerException = {
            statusCode: 500,
            error: { type: 'INTERNAL_ERROR', description: 'Internal server error' },
        };

        handleServiceError(app, response);

        expect(app.notification.error).toHaveBeenCalledWith({
            message: 'Algo deu errado!',
            description: 'Internal server error',
        });
    });

    it('calls notification.error with makeMessage result when provided', () => {
        const app = makeApp();
        const response: Service.ServerException = {
            statusCode: 409,
            error: { type: 'CONFLICT', description: 'CNPJ already exists' },
        };
        const makeMessage = vi.fn().mockReturnValue('Este CNPJ já está cadastrado.');

        handleServiceError(app, response, makeMessage);

        expect(makeMessage).toHaveBeenCalledWith(response);
        expect(app.notification.error).toHaveBeenCalledWith({
            message: 'Algo deu errado!',
            description: 'Este CNPJ já está cadastrado.',
        });
    });

    it('falls back to ServerException description when makeMessage returns null', () => {
        const app = makeApp();
        const response: Service.ServerException = {
            statusCode: 409,
            error: { type: 'CONFLICT', description: 'Fallback description' },
        };
        const makeMessage = vi.fn().mockReturnValue(null);

        handleServiceError(app, response, makeMessage);

        expect(app.notification.error).toHaveBeenCalledWith({
            message: 'Algo deu errado!',
            description: 'Fallback description',
        });
    });
});
