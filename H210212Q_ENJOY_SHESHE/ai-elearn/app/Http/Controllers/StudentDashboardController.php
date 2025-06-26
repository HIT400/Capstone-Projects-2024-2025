<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Performance;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $courses = $user->courses; 
        $quizzesTaken = Result::where('user_id', $user->id)->count();
        $performanceData = Performance::where('user_id', $user->id)->with('topic')->get();

        $labels = $performanceData->pluck('topic.title');
        $scores = $performanceData->pluck('last_score');

        

        return view('student.student-dashboard', compact('courses', 'quizzesTaken', 'labels', 'scores'));
    }
}



