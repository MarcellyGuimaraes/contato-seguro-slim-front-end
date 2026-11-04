import type { Service } from '@domain/@shared/service.type';
import { createInvolvement } from '@domain/involvement/api/create-involvement.service';
import type { Involvement } from '@domain/involvement/involvement.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRecord } from './api/create-record.service';
import { createRecordWithInvolvements, type NewRecord } from './create-record-with-involvements';
import type { Record } from './record.type';

vi.mock('./api/create-record.service', () => ({ createRecord: vi.fn() }));
vi.mock('@domain/involvement/api/create-involvement.service', () => ({ createInvolvement: vi.fn() }));

const newRecord: NewRecord = {
    title: 'Assédio no setor',
    description: 'Descrição do ocorrido',
    company_id: 7,
};

const createdRecord: Record.Model = {
    id: 42,
    title: newRecord.title,
    description: newRecord.description,
    status: 'awaiting_investigation',
    company_id: newRecord.company_id,
    created_at: '2026-11-04T10:00:00.000000Z',
    updated_at: '2026-11-04T10:00:00.000000Z',
    deleted_at: null,
};

const recordSuccess = { statusCode: 201, data: { record: createdRecord } };

const involvementSuccess = (body: Involvement.Body) => ({
    statusCode: 201,
    data: {
        involvement: {
            id: body.person_id,
            type: body.type,
            record_id: createdRecord.id,
            person_id: body.person_id,
            created_at: '2026-11-04T10:00:00.000000Z',
            updated_at: null,
            deleted_at: null,
            person: null,
        },
    },
});

const serverError = (statusCode: number): Service.ServerException => ({
    statusCode,
    error: { type: 'ERROR', description: 'Something went wrong' },
});

describe('createRecordWithInvolvements', () => {
    beforeEach(() => {
        vi.mocked(createRecord).mockReset();
        vi.mocked(createInvolvement).mockReset();
    });

    it('sends awaiting_investigation as status', async () => {
        vi.mocked(createRecord).mockResolvedValue(recordSuccess);

        await createRecordWithInvolvements(newRecord, []);

        expect(createRecord).toHaveBeenCalledWith({
            title: newRecord.title,
            description: newRecord.description,
            company_id: newRecord.company_id,
            status: 'awaiting_investigation',
        });
    });

    it('returns record_failed and creates no involvements when the record fails', async () => {
        const response = serverError(500);
        vi.mocked(createRecord).mockResolvedValue(response);

        const result = await createRecordWithInvolvements(newRecord, [{ person_id: 1, type: 'whistleblower' }]);

        expect(result.status).toBe('record_failed');
        expect(result.status === 'record_failed' && result.response).toBe(response);
        expect(createInvolvement).not.toHaveBeenCalled();
    });

    it('creates no involvements when the list is empty', async () => {
        vi.mocked(createRecord).mockResolvedValue(recordSuccess);

        const result = await createRecordWithInvolvements(newRecord, []);

        expect(result).toEqual({ status: 'created', record: createdRecord, failedCount: 0 });
        expect(createInvolvement).not.toHaveBeenCalled();
    });

    it('links every involvement to the created record id', async () => {
        vi.mocked(createRecord).mockResolvedValue(recordSuccess);
        vi.mocked(createInvolvement).mockImplementation(async (_, body) => involvementSuccess(body));

        await createRecordWithInvolvements(newRecord, [
            { person_id: 1, type: 'whistleblower' },
            { person_id: 2, type: 'witness' },
        ]);

        expect(createInvolvement).toHaveBeenCalledTimes(2);
        expect(createInvolvement).toHaveBeenCalledWith(42, { person_id: 1, type: 'whistleblower' });
        expect(createInvolvement).toHaveBeenCalledWith(42, { person_id: 2, type: 'witness' });
    });

    it('counts failed involvements', async () => {
        vi.mocked(createRecord).mockResolvedValue(recordSuccess);
        vi.mocked(createInvolvement)
            .mockResolvedValueOnce(involvementSuccess({ person_id: 1, type: 'whistleblower' }))
            .mockResolvedValueOnce(serverError(409))
            .mockResolvedValueOnce(new Error('network'));

        const result = await createRecordWithInvolvements(newRecord, [
            { person_id: 1, type: 'whistleblower' },
            { person_id: 2, type: 'witness' },
            { person_id: 3, type: 'victim' },
        ]);

        expect(result).toEqual({ status: 'created', record: createdRecord, failedCount: 2 });
    });

    it('counts a rejected involvement as failed', async () => {
        vi.mocked(createRecord).mockResolvedValue(recordSuccess);
        vi.mocked(createInvolvement)
            .mockResolvedValueOnce(involvementSuccess({ person_id: 1, type: 'whistleblower' }))
            .mockRejectedValueOnce(new Error('unexpected'));

        const result = await createRecordWithInvolvements(newRecord, [
            { person_id: 1, type: 'whistleblower' },
            { person_id: 2, type: 'witness' },
        ]);

        expect(result.status === 'created' && result.failedCount).toBe(1);
    });
});
