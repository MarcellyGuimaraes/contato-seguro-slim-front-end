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
 * @route /records/:id
 * @http PUT
 */
export const updateRecord = (
    id: Record.Model['id'],
    body: Body,
): Promise<Response> => Request.put(`/records/${id}`, body);
