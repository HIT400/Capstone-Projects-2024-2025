<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Topic;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $totalStudents = User::whereHas('roles', function ($q) {
            $q->where('name', 'Student');
        })->count();
    
        $totalCourses = Course::count();
        $totalTopics = Topic::count();
    
        $enrollments = DB::table('user_courses')->count();
    
        // Optional: data for graphs
        $studentsPerCourse = Course::withCount(['users' => function ($q) {
            $q->whereHas('roles', fn($r) => $r->where('name', 'Student'));
        }])->get();
    
        return view('admin.admin', compact(
            'totalUsers',
            'totalStudents',
            'totalCourses',
            'totalTopics',
            'enrollments',
            'studentsPerCourse'
        ));
    }
    
}
