import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Person } from '../person.type';

type Response =
    | Service.DefaultResponse
    | Service.ExceptionResponse;

/**
 * @service
 * @route /people/:id
 * @http DELETE
 */
export const deletePerson = (
    id: Person.Model['id'],
): Promise<Response> => Request.delete(`/people/${id}`);
