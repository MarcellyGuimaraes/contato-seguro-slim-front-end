import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Company } from '../company.type';

type Data = { company: Company.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /companies/:id
 * @http GET
 */
export const findCompany = (
    id: Company.Model['id'],
): Promise<Response> => Request.get(`/companies/${id}`);
