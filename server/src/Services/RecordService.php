<?php

namespace App\Services;

use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Record;

class RecordService
{
    private const VALID_STATUSES = [
        'awaiting_investigation',
        'investigation_in_progress',
        'resolved',
        'archived',
    ];

    public function __construct(protected CompanyService $companyService) {}

    public function list()
    {
        return Record::with('company')->get();
    }

    public function listByCompany(int $companyId)
    {
        $this->companyService->find($companyId);

        return Record::where('company_id', $companyId)->with('company')->get();
    }

    public function find(int $id): Record
    {
        $record = Record::with('company')->find($id);

        if (!$record) {
            throw new HttpNotFoundException('Record not found');
        }

        return $record;
    }

    public function create(array $data): Record
    {
        $this->validateRecordData($data);

        $this->companyService->find($data['company_id']);

        return Record::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => $data['status'],
            'company_id' => $data['company_id'],
        ]);
    }

    public function update(int $id, array $data): Record
    {
        $record = $this->find($id);

        $this->validateRecordData($data);

        if (isset($data['company_id'])) {
            $this->companyService->find($data['company_id']);
        }

        $record->fill([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => $data['status'],
            'company_id' => $data['company_id'],
        ]);

        $record->save();

        return $record;
    }

    public function delete(int $id): bool
    {
        $record = $this->find($id);

        return $record->delete();
    }

    /** @throws HttpUnprocessableEntityException */
    private function validateRecordData(array $data): void
    {
        if (empty($data['title'])) {
            throw new HttpUnprocessableEntityException('Title is required');
        }

        if (empty($data['description'])) {
            throw new HttpUnprocessableEntityException('Description is required');
        }

        if (empty($data['status'])) {
            throw new HttpUnprocessableEntityException('Status is required');
        }

        if (!in_array($data['status'], self::VALID_STATUSES)) {
            throw new HttpUnprocessableEntityException(
                'Invalid status. Must be one of: ' . implode(', ', self::VALID_STATUSES)
            );
        }

        if (empty($data['company_id'])) {
            throw new HttpUnprocessableEntityException('Company ID is required');
        }
    }
}
