type Route = `/${string}`;
type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

export const BASE_URL = import.meta.env.VITE_API_URL;

const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

async function call(route: Route, method: Method, data: unknown) {
    const input: RequestInfo = BASE_URL + route;

    const body: RequestInit['body'] = data !== null
        ? JSON.stringify(data)
        : null;

    const init: RequestInit = {
        body,
        headers: DEFAULT_HEADERS,
        method,
    };

    try {
        const response = await fetch(input, init);

        const data = await response.json();

        return data;
    } catch (error) {
        return error;
    }
}

export const Request = {
    post: (route: Route, data: unknown) => call(route, 'post', data),
    put: (route: Route, data: unknown) => call(route, 'put', data),
    get: (route: Route) => call(route, 'get', null),
    delete: (route: Route) => call(route, 'delete', null),
};
