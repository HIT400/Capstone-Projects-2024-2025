<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'description','notes', 'topic_id', 'status'];

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    public function quizzes()
{
    return $this->hasMany(Quiz::class);
}
}
