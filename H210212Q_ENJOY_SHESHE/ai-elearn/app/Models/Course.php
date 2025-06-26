<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'department_id', 'status'];

    public function topics()
    {
        return $this->hasMany(Topic::class);
    }
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_courses');
    }
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function certificates()
{
    return $this->hasMany(Certificate::class);
}

public function quizAttempts()
{
    return $this->hasManyThrough(QuizResult::class, Quiz::class);
}
}
