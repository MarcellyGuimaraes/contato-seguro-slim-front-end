import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Record } from '../record.type';

type Data = { records: Record.Model[] };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records
 * @http GET
 */
export const listRecords = (): Promise<Response> =>
    Request.get('/records');
