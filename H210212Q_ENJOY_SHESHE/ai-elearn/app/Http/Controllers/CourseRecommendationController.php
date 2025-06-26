<?php

namespace App\Http\Controllers;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use App\Models\Course;
use Illuminate\Http\Request;
use Rubix\ML\Tokenizers\Word;
use Rubix\ML\Datasets\Labeled;
use Illuminate\Support\Facades\Auth;
use Rubix\ML\Classifiers\KNearestNeighbors;
use Rubix\ML\CrossValidation\Metrics\FBeta;
use Rubix\ML\Transformers\TfIdfTransformer;
use Rubix\ML\CrossValidation\Metrics\Accuracy;
use Rubix\ML\Transformers\WordCountVectorizer;

class CourseRecommendationController extends Controller
{
    protected array $keywordCourseMapping = [
        'web' => 'Web Development',
        'website' => 'Web Development',
        'frontend' => 'Web Development',
        'backend' => 'Web Development',
        'html' => 'Web Development',
        'css' => 'Web Development',
        'javascript' => 'Web Development',

        'game' => 'Game Development',
        '3d' => 'Game Development',
        'vr' => 'Game Development',
        'animation' => 'Game Development',
        'gaming' => 'Game Development',

        'data' => 'Data Science',
        'statistics' => 'Data Science',
        'machine learning' => 'Data Science',

        'mobile' => 'Mobile App Development',
        'android' => 'Mobile App Development',
        'ios' => 'Mobile App Development',
        'app' => 'Mobile App Development',

        'security' => 'Cyber Security',
        'hacking' => 'Cyber Security',
        'malware' => 'Cyber Security',
        'cryptography' => 'Cyber Security',

        'ai' => 'Artificial Intelligence (AI)',
        'artificial intelligence' => 'Artificial Intelligence (AI)',
        'deep learning' => 'Artificial Intelligence (AI)',
        'computer vision' => 'Artificial Intelligence (AI)',
        'nlp' => 'Artificial Intelligence (AI)',
    ];

    protected array $courses = [
        'Web Development',
        'Game Development',
        'Data Science',
        'Mobile App Development',
        'Cyber Security',
        'Artificial Intelligence (AI)',
    ];

   
    


//     public function recommend(Request $request)
// {
//    // Convert the interests array into a comma-separated string
//    $interests = implode(',', $request->interests); // e.g., "AI, Data"
//    $score = $request->quiz_avg; // e.g., 80

//    // Specify the absolute path to the Python script
//    $pythonScriptPath = 'C:\\Users\\HP Pavilion\\Desktop\\STAFF RANGU\\ai-elearn\\recommend.py';

//    // Run the Python script with interests and quiz score as arguments
//    $command = ['python', $pythonScriptPath, $interests, $score];
//    $process = new Process($command);
//    $process->run();

//    // Check if the process was successful
//    if (!$process->isSuccessful()) {
//        throw new ProcessFailedException($process);
//    }

//    // Return the recommended course in the JSON response
//    return response()->json([
//        'recommendation' => trim($process->getOutput())
//    ]);;
// }

    public function recommend(Request $request)
    {
        $request->validate([
            'interest' => 'required|string',
        ]);
    
        $userInterest = strtolower($request->input('interest'));
        $recommendedCourse = null;
    
        // Match interest to course
        foreach ($this->keywordCourseMapping as $keyword => $course) {
            if (strpos($userInterest, $keyword) !== false) {
                $recommendedCourse = $course;
                break;
            }
        }
    
        // Fetch all active courses from the database
        $courses = Course::where('status', 'Active')->get();
    
        // If no match was found, return "Course not found"
        if (!$recommendedCourse) {
            return view('recommendation.select_course', [
                'recommendedCourse' => 'Course not found',
                'courses' => $courses,
            ]);
        }
    
        // Optional: Dummy metrics (if desired)
        $metrics = [
            'accuracy' => '100.00%',
            'f1_score' => '100.00%',
        ];
    
        return view('recommendation.select_course', [
            'recommendedCourse' => $recommendedCourse,
            'courses' => $courses,
            'metrics' => $metrics,
        ]);
    } public function enroll(Request $request)
{
    $request->validate([
        'course_id' => 'required|exists:courses,id',
    ]);

    $courseId = $request->input('course_id');
    $user = auth()->user();

    // Check if already enrolled
    if ($user->courses->contains($courseId)) {
        return redirect()->route('my-courses')->with('error', 'You are already enrolled in this course.');
    }

    // Attach the course with pivot data
    $user->courses()->syncWithoutDetaching([$courseId => ['status' => 'Active']]);

    // Refresh user's courses
    $userCourses = $user->fresh()->courses;

    return view('my-courses', compact('userCourses'))->with('success', 'You have successfully enrolled in the course!');
}

    
}
