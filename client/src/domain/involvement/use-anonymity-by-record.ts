import { useEffect, useState } from 'react';

import { hasServiceError } from '@domain/@shared/service.helper';
import type { Record } from '@domain/record/record.type';

import { listInvolvements } from './api/list-involvements.service';
import type { AnonymityStatus } from './components/AnonymityTag';

export function useAnonymityByRecord(records: Record.Model[]) {
    const [statusByRecord, setStatusByRecord] = useState(new Map<Record.Model['id'], AnonymityStatus>());

    useEffect(() => {
        let isCancelled = false;

        setStatusByRecord(new Map(records.map(record => [record.id, 'loading'] as const)));

        records.forEach(async record => {
            const response = await listInvolvements(record.id);

            if (isCancelled)
                return;

            const status: AnonymityStatus = hasServiceError(response)
                ? 'error'
                : response.data.is_anonymous ? 'anonymous' : 'identified';

            setStatusByRecord(previous => new Map(previous).set(record.id, status));
        });

        return () => {
            isCancelled = true;
        };
    }, [records]);

    return statusByRecord;
}
