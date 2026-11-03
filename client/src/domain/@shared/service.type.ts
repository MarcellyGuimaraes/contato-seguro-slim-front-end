export namespace Service {
    /** API responded successfully! */
    export type DefaultResponse<D = unknown> = {
        statusCode: number,
        data: D,
    };

    export type ServerException = {
        statusCode: number,
        error: {
            type: string,
            description: string,
        },
    };

    export type ClientException = Error;

    /** API responded with an error or the JavaScript throws an Error object! */
    export type ExceptionResponse = ServerException | ClientException;
}
