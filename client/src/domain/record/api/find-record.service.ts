import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Record } from '../record.type';

type Data = { record: Record.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:id
 * @http GET
 */
export const findRecord = (
    id: Record.Model['id'],
): Promise<Response> => Request.get(`/records/${id}`);
