<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use SoftDeletes;

    protected $table = 'people';

    protected $fillable = [
        'name',
        'cpf',
        'email',
        'birth_date',
    ];

    public function involvements()
    {
        return $this->hasMany(Involvement::class);
    }
}
