<?php

namespace App\Services;

use App\Http\Error\HttpBadRequestException;
use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Company;

class CompanyService
{
    public function list()
    {
        return Company::all();
    }

    public function find(int $id): Company
    {
        $company = Company::find($id);

        if (!$company) {
            throw new HttpNotFoundException('Company not found');
        }

        return $company;
    }

    public function create(array $data): Company
    {
        $this->validateCompanyData($data);

        $company = Company::create([
            'name' => $data['name'],
            'cnpj' => $data['cnpj'],
            'email' => $data['email'],
        ]);

        return $company;
    }

    public function update(int $id, array $data): Company
    {
        $company = $this->find($id);

        $this->validateCompanyData($data, $id);

        $company->fill([
            'name' => $data['name'],
            'cnpj' => $data['cnpj'],
            'email' => $data['email'],
        ]);

        $company->save();

        return $company;
    }

    public function delete(int $id): bool
    {
        $company = $this->find($id);

        if ($company->records()->count() > 0) {
            throw new HttpBadRequestException('Cannot delete company with records');
        }

        return $company->delete();
    }

    /** @throws HttpUnprocessableEntityException */
    private function validateCompanyData(array $data, ?int $excludeId = null): void
    {
        if (empty($data['name'])) {
            throw new HttpUnprocessableEntityException('Name is required');
        }

        if (empty($data['cnpj'])) {
            throw new HttpUnprocessableEntityException('CNPJ is required');
        }

        if (!preg_match('/^\d{14}$/', $data['cnpj'])) {
            throw new HttpUnprocessableEntityException('Invalid CNPJ format. Must be 14 digits');
        }

        if (empty($data['email'])) {
            throw new HttpUnprocessableEntityException('Email is required');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new HttpUnprocessableEntityException('Invalid email format');
        }

        $query = Company::where('cnpj', $data['cnpj']);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new HttpUnprocessableEntityException('CNPJ already registered');
        }
    }
}
