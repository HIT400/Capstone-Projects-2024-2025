<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    protected $fillable = [ 'user_id',
    'topic_id',
    'quiz_id',
    'result_id',
    'answer_id',
    'is_correct',];

    public function quiz()
{
    return $this->belongsTo(Quiz::class);
}
}
