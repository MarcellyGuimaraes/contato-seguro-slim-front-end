<?php

use App\Controllers\CompanyController;
use App\Controllers\InvolvementController;
use App\Controllers\PersonController;
use App\Controllers\RecordController;
use App\Http\Response\ResponseBuilder;
use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $app->options('/{routes:.*}', function (Request $request, Response $response) {
        // CORS Pre-Flight OPTIONS Request Handler
        return $response;
    });

    $app->get('/', function (Request $request, Response $response) {
        $data = ['message' => 'Welcome to the Contato Seguro Slim REST API'];

        return ResponseBuilder::respondWithData($response, data: $data);
    });

    $app->group('/companies', function (RouteCollectorProxy $group) {
        $group->get('', [CompanyController::class, 'list']);
        $group->get('/{id}', [CompanyController::class, 'find']);
        $group->post('', [CompanyController::class, 'create']);
        $group->put('/{id}', [CompanyController::class, 'update']);
        $group->delete('/{id}', [CompanyController::class, 'delete']);
    });

    $app->group('/records', function (RouteCollectorProxy $group) {
        $group->get('', [RecordController::class, 'list']);
        $group->get('/{id}', [RecordController::class, 'find']);
        $group->post('', [RecordController::class, 'create']);
        $group->put('/{id}', [RecordController::class, 'update']);
        $group->delete('/{id}', [RecordController::class, 'delete']);
    });

    $app->group('/people', function (RouteCollectorProxy $group) {
        $group->get('', [PersonController::class, 'list']);
        $group->get('/{id}', [PersonController::class, 'find']);
        $group->post('', [PersonController::class, 'create']);
        $group->put('/{id}', [PersonController::class, 'update']);
        $group->delete('/{id}', [PersonController::class, 'delete']);
    });

    $app->group('/records/{record_id}/involvements', function (RouteCollectorProxy $group) {
        $group->get('', [InvolvementController::class, 'list']);
        $group->post('', [InvolvementController::class, 'create']);
        $group->delete('/{id}', [InvolvementController::class, 'delete']);
    });
};
