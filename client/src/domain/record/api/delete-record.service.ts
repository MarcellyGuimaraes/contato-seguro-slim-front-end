import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Record } from '../record.type';

type Response =
    | Service.DefaultResponse
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:id
 * @http DELETE
 */
export const deleteRecord = (
    id: Record.Model['id'],
): Promise<Response> => Request.delete(`/records/${id}`);
