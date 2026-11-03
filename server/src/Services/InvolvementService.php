<?php

namespace App\Services;

use App\Http\Error\HttpConflictException;
use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Enums\InvolvementType;
use App\Models\Involvement;

class InvolvementService
{
    public function __construct(
        protected RecordService $recordService,
        protected PersonService $personService,
    ) {}

    public function listByRecord(int $recordId): array
    {
        $record = $this->recordService->find($recordId);

        $involvements = Involvement::with('person')
            ->where('record_id', $recordId)
            ->get();

        return [
            'involvements' => $involvements,
            'is_anonymous' => $record->isAnonymous(),
        ];
    }

    public function create(int $recordId, array $data): Involvement
    {
        $this->recordService->find($recordId);

        $this->validateInvolvementData($data);

        $this->personService->find($data['person_id']);

        $exists = Involvement::where('record_id', $recordId)
            ->where('person_id', $data['person_id'])
            ->exists();

        if ($exists) {
            throw new HttpConflictException('Person already involved in this record');
        }

        return Involvement::create([
            'record_id' => $recordId,
            'person_id' => $data['person_id'],
            'type' => $data['type'],
        ]);
    }

    public function delete(int $recordId, int $involvementId): bool
    {
        $involvement = Involvement::where('record_id', $recordId)
            ->where('id', $involvementId)
            ->first();

        if (!$involvement) {
            throw new HttpNotFoundException('Involvement not found');
        }

        return $involvement->delete();
    }

    /** @throws HttpUnprocessableEntityException */
    private function validateInvolvementData(array $data): void
    {
        if (empty($data['person_id'])) {
            throw new HttpUnprocessableEntityException('Person ID is required');
        }

        if (empty($data['type'])) {
            throw new HttpUnprocessableEntityException('Type is required');
        }

        if (!InvolvementType::tryFrom($data['type'])) {
            $valid = implode(', ', array_column(InvolvementType::cases(), 'value'));
            throw new HttpUnprocessableEntityException(
                'Invalid type. Must be one of: ' . $valid
            );
        }
    }
}
