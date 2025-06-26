<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;
    protected $fillable = ['quiz_id', 'answer_text', 'is_correct', 'status'];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function quizResults()
{
    return $this->hasMany(QuizResult::class);
}
}
