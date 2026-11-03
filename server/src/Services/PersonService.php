<?php

namespace App\Services;

use App\Http\Error\HttpConflictException;
use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Person;

class PersonService
{
    public function list()
    {
        return Person::all();
    }

    public function find(int $id): Person
    {
        $person = Person::find($id);

        if (!$person) {
            throw new HttpNotFoundException('Person not found');
        }

        return $person;
    }

    public function create(array $data): Person
    {
        $this->validatePersonData($data);

        return Person::create([
            'name' => $data['name'],
            'cpf' => $data['cpf'],
            'email' => $data['email'],
            'birth_date' => $data['birth_date'],
        ]);
    }

    public function update(int $id, array $data): Person
    {
        $person = $this->find($id);

        $this->validatePersonData($data, $id);

        $person->fill([
            'name' => $data['name'],
            'cpf' => $data['cpf'],
            'email' => $data['email'],
            'birth_date' => $data['birth_date'],
        ]);

        $person->save();

        return $person;
    }

    public function delete(int $id): bool
    {
        $person = $this->find($id);

        return $person->delete();
    }

    /** @throws HttpUnprocessableEntityException|HttpConflictException */
    private function validatePersonData(array $data, ?int $excludeId = null): void
    {
        if (empty($data['name'])) {
            throw new HttpUnprocessableEntityException('Name is required');
        }

        if (empty($data['cpf'])) {
            throw new HttpUnprocessableEntityException('CPF is required');
        }

        if (!preg_match('/^\d{11}$/', $data['cpf'])) {
            throw new HttpUnprocessableEntityException('Invalid CPF format. Must be 11 digits');
        }

        if (empty($data['email'])) {
            throw new HttpUnprocessableEntityException('Email is required');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new HttpUnprocessableEntityException('Invalid email format');
        }

        if (empty($data['birth_date'])) {
            throw new HttpUnprocessableEntityException('Birth date is required');
        }

        if (!strtotime($data['birth_date'])) {
            throw new HttpUnprocessableEntityException('Invalid birth date format');
        }

        $query = Person::where('cpf', $data['cpf']);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new HttpConflictException('CPF already registered');
        }
    }
}
