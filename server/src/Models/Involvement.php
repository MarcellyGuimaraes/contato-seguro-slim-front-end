<?php

namespace App\Models;

use App\Models\Enums\InvolvementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Involvement extends Model
{
    use SoftDeletes;

    protected $table = 'involvements';

    protected $fillable = [
        'record_id',
        'person_id',
        'type',
    ];

    protected $casts = [
        'type' => InvolvementType::class,
    ];

    public function record()
    {
        return $this->belongsTo(Record::class);
    }

    public function person()
    {
        return $this->belongsTo(Person::class);
    }
}
