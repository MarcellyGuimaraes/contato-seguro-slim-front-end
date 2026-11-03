<?php

namespace App\Models;

use App\Models\Enums\InvolvementType;
use App\Models\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Record extends Model
{
    use SoftDeletes;

    protected $table = 'records';

    protected $fillable = [
        'title',
        'description',
        'status',
        'company_id',
    ];

    protected $casts = [
        'status' => RecordStatus::class,
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function involvements()
    {
        return $this->hasMany(Involvement::class);
    }

    public function isAnonymous(): bool
    {
        return !$this->involvements()
            ->where('type', InvolvementType::Whistleblower)
            ->exists();
    }
}
