import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Person } from '../person.type';

type Data = { people: Person.Model[] };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /people
 * @http GET
 */
export const listPeople = (): Promise<Response> =>
    Request.get('/people');
