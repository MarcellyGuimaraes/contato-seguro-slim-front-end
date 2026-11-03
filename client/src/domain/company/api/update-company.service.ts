import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Company } from '../company.type';

type Body = Pick<Company.Model, 'name' | 'cnpj' | 'email'>;

type Data = { company: Company.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /companies/:id
 * @http PUT
 */
export const updateCompany = (
    id: Company.Model['id'],
    body: Body
): Promise<Response> => Request.put(`/companies/${id}`, body);
