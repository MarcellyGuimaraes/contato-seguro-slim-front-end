import { hasServiceError } from '@domain/@shared/service.helper';
import type { Service } from '@domain/@shared/service.type';
import { createInvolvement } from '@domain/involvement/api/create-involvement.service';
import type { Involvement } from '@domain/involvement/involvement.type';

import { createRecord } from './api/create-record.service';
import type { Record } from './record.type';

export type NewRecord = Pick<Record.Model, 'title' | 'description' | 'company_id'>;

export type CreateRecordWithInvolvementsResult =
    | { status: 'record_failed'; response: Service.ExceptionResponse }
    | { status: 'created'; record: Record.Model; failedCount: number };

export async function createRecordWithInvolvements(
    record: NewRecord,
    involvements: Involvement.Body[],
): Promise<CreateRecordWithInvolvementsResult> {
    const recordResponse = await createRecord({ ...record, status: 'awaiting_investigation' });

    if (hasServiceError(recordResponse))
        return { status: 'record_failed', response: recordResponse };

    const createdRecord = recordResponse.data.record;

    const results = await Promise.allSettled(
        involvements.map(body => createInvolvement(createdRecord.id, body)),
    );

    const failedCount = results.filter(result =>
        result.status === 'rejected' || hasServiceError(result.value),
    ).length;

    return { status: 'created', record: createdRecord, failedCount };
}
