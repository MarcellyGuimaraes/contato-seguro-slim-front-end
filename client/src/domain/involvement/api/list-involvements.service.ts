import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';
import type { Record } from '@domain/record/record.type';

import type { Involvement } from '../involvement.type';

type Data = {
    involvements: Involvement.Model[];
    is_anonymous: boolean;
};

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:record_id/involvements
 * @http GET
 */
export const listInvolvements = (
    recordId: Record.Model['id'],
): Promise<Response> => Request.get(`/records/${recordId}/involvements`);
