<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'description', 'course_id','order','status'];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function quizResults()
{
    return $this->hasMany(QuizResult::class);
}
public function progresses()
{
    return $this->hasMany(Performance::class);
}
}

