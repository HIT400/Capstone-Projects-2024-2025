<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'grade_letter', 'min_score', 'max_score', 'status', 'created_at', 'updated_at'
    ];

    public function results()
    {
        return $this->hasMany(Result::class);
    }
}
