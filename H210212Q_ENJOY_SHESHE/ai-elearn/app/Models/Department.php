<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;
    protected $fillable = ['name','code', 'status'];

    public function courses()
    {
        return $this->hasMany(Course::class,);
    }

    public function interests()
    {
        return $this->belongsToMany(Interest::class, 'department_interest');
    }
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_department');
    }
}
