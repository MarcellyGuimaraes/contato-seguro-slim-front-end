<?php

namespace App\Controllers;

use App\Http\HttpStatus;
use App\Http\Response\ResponseBuilder;
use App\Services\InvolvementService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class InvolvementController
{
    public function __construct(private InvolvementService $service) {}

    public function list(Request $request, Response $response, array $args): Response
    {
        $data = $this->service->listByRecord($args['record_id']);

        return ResponseBuilder::respondWithData($response, data: $data);
    }

    public function create(Request $request, Response $response, array $args): Response
    {
        $body = $request->getParsedBody();

        $data = ['involvement' => $this->service->create($args['record_id'], $body)];

        return ResponseBuilder::respondWithData($response, HttpStatus::Created, $data);
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $deleted = $this->service->delete($args['record_id'], $args['id']);

        $status = $deleted ? HttpStatus::OK : HttpStatus::ServerError;

        return ResponseBuilder::respondWithData($response, $status);
    }
}
