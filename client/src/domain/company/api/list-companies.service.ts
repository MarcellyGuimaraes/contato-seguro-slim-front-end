import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Company } from '../company.type';

type Data = { companies: Company.Model[] };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /companies
 * @http GET
 */
export const listCompanies = (): Promise<Response> =>
    Request.get('/companies');
