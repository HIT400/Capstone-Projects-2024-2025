<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'user_courses');
    }
    public function interests()
    {
        return $this->belongsToMany(Interest::class, 'user_interest');
    }
    public function departments()
    {
        return $this->belongsToMany(Department::class, 'user_department');
    }
    public function results()
    {
        return $this->hasMany(Result::class);
    }
    public function progresses()
    {
        return $this->hasMany(Performance::class);
    }

    public function quizResults()
{
    return $this->hasMany(QuizResult::class);
}

public function hasRole($role)
{
    return $this->roles->contains('name', $role);
}
public function certificates()
{
    return $this->hasMany(Certificate::class);
}
}
