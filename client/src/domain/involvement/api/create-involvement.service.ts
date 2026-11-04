import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';
import type { Record } from '@domain/record/record.type';

import type { Involvement } from '../involvement.type';

type Data = { involvement: Involvement.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:record_id/involvements
 * @http POST
 */
export const createInvolvement = (
    recordId: Record.Model['id'],
    body: Involvement.Body,
): Promise<Response> => Request.post(`/records/${recordId}/involvements`, body);
