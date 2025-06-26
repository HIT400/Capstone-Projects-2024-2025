<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'quiz_id','total_score', 'score', 'grade_id', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');

    } public function grade()
{
    return $this->belongsTo(Grade::class, 'grade_id');
}
}
