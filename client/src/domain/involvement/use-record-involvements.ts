import { useCallback, useEffect, useState } from 'react';

import { App } from 'antd';

import { translateApiError } from '@domain/@shared/api-error-message';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import type { Record } from '@domain/record/record.type';

import { listInvolvements } from './api/list-involvements.service';
import type { Involvement } from './involvement.type';

export function useRecordInvolvements(recordId: Record.Model['id']) {
    const [involvements, setInvolvements] = useState<Involvement.Model[]>([]);
    const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const app = App.useApp();

    const fetchInvolvements = useCallback(async () => {
        setIsLoading(true);

        const response = await listInvolvements(recordId);

        setIsLoading(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        setInvolvements(response.data.involvements);
        setIsAnonymous(response.data.is_anonymous);
    }, [app, recordId]);

    useEffect(() => {
        fetchInvolvements();
    }, [fetchInvolvements]);

    return {
        involvements,
        isAnonymous,
        isLoading,
        fetchInvolvements,
    };
}
