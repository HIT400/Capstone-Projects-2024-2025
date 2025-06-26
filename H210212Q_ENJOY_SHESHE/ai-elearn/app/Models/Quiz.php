<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = ['question', 'topic_id', 'status'];

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function quizResults()
{
    return $this->hasMany(QuizResult::class);
}
public function content()
{
    return $this->belongsTo(Content::class);
}

}
