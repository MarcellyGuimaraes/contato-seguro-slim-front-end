import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Company } from '../company.type';

type Response =
    | Service.DefaultResponse
    | Service.ExceptionResponse;

/**
 * @service
 * @route /companies/:id
 * @http DELETE
 */
export const deleteCompany = (
    id: Company.Model['id']
): Promise<Response> => Request.delete(`/companies/${id}`);
