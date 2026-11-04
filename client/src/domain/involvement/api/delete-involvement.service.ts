import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';
import type { Record } from '@domain/record/record.type';

import type { Involvement } from '../involvement.type';

type Response =
    | Service.DefaultResponse
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:record_id/involvements/:id
 * @http DELETE
 */
export const deleteInvolvement = (
    recordId: Record.Model['id'],
    id: Involvement.Model['id'],
): Promise<Response> => Request.delete(`/records/${recordId}/involvements/${id}`);
