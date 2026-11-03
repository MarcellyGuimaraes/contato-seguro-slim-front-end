import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Record } from '../record.type';

type Body = Pick<Record.Model, 'title' | 'description' | 'status' | 'company_id'>;

type Data = { record: Record.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records
 * @http POST
 */
export const createRecord = (
    body: Body,
): Promise<Response> => Request.post('/records', body);
