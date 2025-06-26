<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\InterestController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\CourseRecommendationController;


Route::get('/', function () {
    return view('auth.login');
});

Route::get('/student/dashboard', function () {
    $user = Auth::user();

    if ($user->roles->contains('name', 'Student')) {
        return view('student.student-dashboard');
    } elseif ($user->roles->contains('name', 'Admin')) {
        return view('admin.admin');
    }   
})->middleware(['auth', 'verified']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';


Route::prefix('users')->group(function () {
//User Routes
    Route::get('/users/user', [UserController::class, 'index'])->name('user-index');
    Route::post('/users/{id}/assign-department', [UserController::class, 'assignDepartment'])->name('assign-department');
    Route::post('/users/{id}/assign-course', [UserController::class, 'assignCourse'])->name('assign-course');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('course-show');
});

// Department Routes
Route::get('/departments/index', [DepartmentController::class, 'index'])->name('department-index');
Route::get('/departments/create', [DepartmentController::class, 'create'])->name('department-create');
Route::post('/departments/store', [DepartmentController::class, 'store'])->name('department-store');
Route::get('/departments/{id}', [DepartmentController::class, 'show'])->name('department-show');
Route::get('/departments/{id}/edit', [DepartmentController::class, 'edit'])->name('department-edit');
Route::put('/departments/{id}', [DepartmentController::class, 'update'])->name('department-update');
Route::delete('/departments/{id}', [DepartmentController::class, 'destroy'])->name('department-destroy');

// Course Routes
Route::get('/courses/index', [CourseController::class, 'index'])->name('course-index');
Route::get('/courses/{id}', [CourseController::class, 'show'])->name('course-view');
Route::post('/courses/store', [CourseController::class, 'store'])->name('course-store');
Route::get('/courses/{id}/edit', [CourseController::class, 'edit'])->name('course-edit');
Route::put('/courses/{id}', [CourseController::class, 'update'])->name('course-update');
Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('course-destroy');
Route::get('/my-courses', [CourseController::class, 'myCourses'])->name('my-courses');

// Grade Routes
Route::get('grades/index', [GradeController::class, 'index'])->name('grade-index');
Route::get('/grades/create', [GradeController::class, 'create'])->name('grade-create');
Route::post('/grades/store', [GradeController::class, 'store'])->name('grade-store');
Route::get('/grades/{id}', [GradeController::class, 'show'])->name('grade-show');
Route::get('/grades/{id}/edit', [GradeController::class, 'edit'])->name('grade-edit');
Route::put('/grades/{id}', [GradeController::class, 'update'])->name('grade-update');
Route::delete('/grades/{id}', [GradeController::class, 'destroy'])->name('grades-destroy');


// Role Routes
Route::get('/roles/index', [RoleController::class, 'index'])->name('roles-index');
Route::get('/roles/create', [RoleController::class, 'create'])->name('role-create');
Route::post('/roles/store', [RoleController::class, 'store'])->name('role-store');;
Route::get('/roles/{id}/edit', [RoleController::class, 'edit'])->name('role-edit');
Route::put('/roles/{id}', [RoleController::class, 'update'])->name('role-update');
Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->name('role-destroy');


// Topic Routes
Route::get('/topics/index', [TopicController::class, 'index'])->name('topic-index');
Route::get('/topics/create', [TopicController::class, 'create'])->name('topic-create');
Route::post('/topics', [TopicController::class, 'store'])->name('topic-store');
Route::get('/topics/{id}', [TopicController::class, 'show'])->name('topic-show');
Route::get('/topics/{id}/edit', [TopicController::class, 'edit'])->name('topic-edit');
Route::put('/topics/{id}', [TopicController::class, 'update'])->name('topic-update');
Route::delete('/topics/{id}', [TopicController::class, 'destroy'])->name('topic-destroy');


// Content Routes
Route::get('/contents', [ContentController::class, 'index'])->name('contents-index');
Route::get('/contents/create', [ContentController::class, 'create'])->name('content-create');
Route::post('/contents', [ContentController::class, 'store'])->name('content-store');
Route::get('/contents/{id}', [ContentController::class, 'show'])->name('content-show');
Route::get('/contents/{id}/edit', [ContentController::class, 'edit'])->name('content-edit');
Route::put('/contents/{id}', [ContentController::class, 'update'])->name('content-update');
Route::delete('/contents/{id}', [ContentController::class, 'destroy'])->name('content-destroy');

// Interest Routes
Route::get('/interests/index', [InterestController::class, 'index'])->name('interest-index');
Route::get('/interests/{id}', [InterestController::class, 'show'])->name('interest-show');
Route::post('/interests/store', [InterestController::class, 'store'])->name('interest-store');
Route::get('/interests/{id}/edit', [InterestController::class, 'edit'])->name('interest-edit');
Route::put('/interests/{id}', [InterestController::class, 'update'])->name('interest-update');
Route::delete('/interests/{id}', [InterestController::class, 'destroy'])->name('interest-destroy');


// Answer Routes
Route::get('/answers', [AnswerController::class, 'index'])->name('answer-index');
Route::get('/answers/create', [AnswerController::class, 'create'])->name('answer-create');
Route::post('/answers', [AnswerController::class, 'store'])->name('answer-store');
Route::get('/answers/{id}', [AnswerController::class, 'show'])->name('answer-show');
Route::get('/answers/{id}/edit', [AnswerController::class, 'edit'])->name('answer-edit');
Route::put('/answers/{id}', [AnswerController::class, 'update'])->name('answer-update');
Route::delete('/answers/{id}', [AnswerController::class, 'destroy'])->name('answer-destroy');

// Results Routes
Route::get('/results', [ResultController::class, 'index'])->name('result-index');
Route::get('/results/create', [ResultController::class, 'create'])->name('result-create');
Route::post('/results', [ResultController::class, 'store'])->name('result-store');
Route::get('/results/{id}', [ResultController::class, 'show'])->name('result-show');
Route::get('/results/{id}/edit', [ResultController::class, 'edit'])->name('result-edit');
Route::put('/results/{id}', [ResultController::class, 'update'])->name('result-update');
Route::delete('/results/{id}', [ResultController::class, 'destroy'])->name('result-destroy');

// Quiz Routes
Route::get('/quizzes', [QuizController::class, 'index'])->name('quiz-index');
Route::get('/quizzes/create', [QuizController::class, 'create'])->name('quiz-create');
Route::post('/quizzes', [QuizController::class, 'store'])->name('quiz-store');
Route::get('/quizzes/{id}', [QuizController::class, 'show'])->name('quiz-view');

Route::get('/topics/{id}/quiz', [QuizController::class, 'showTopicQuiz'])->name('quiz-show');
Route::post('/topics/{id}/quiz', [QuizController::class, 'submitTopicQuiz'])->name('quiz-submit');

Route::get('/quizzes/{id}/edit', [QuizController::class, 'edit'])->name('quiz-edit');
Route::put('/quizzes/{id}', [QuizController::class, 'update'])->name('quiz-update');
Route::delete('/quizzes/{id}', [QuizController::class, 'destroy'])->name('quiz-destroy');
Route::get('/student/quizzes', [QuizController::class, 'studentIndex'])->name('student-quizzes');
Route::get('/quiz/report/{topic}', [QuizController::class, 'showQuizReport'])->name('quiz-report');
Route::get('/quiz/attempt/{quiz}', [QuizController::class, 'attempt'])->name('quiz-attempt');

// Performance Routes
Route::get('student/grades-performance', [PerformanceController::class, 'index'])->name('student-performances');
Route::get('/student/course/{course}/topics', [PerformanceController::class, 'showTopicsWithReports'])
     ->name('student-report');
Route::get('/student-courses', [PerformanceController::class, 'studentCourses'])->name('student-courses');

    
// Route::get('/performances', [PerformanceController::class, 'index'])->name('performance-index');
Route::get('/performances/create', [PerformanceController::class, 'create'])->name('performance-create');
Route::post('/performances', [PerformanceController::class, 'store'])->name('performance-store');
Route::get('/performances/{id}', [PerformanceController::class, 'show'])->name('performance-show');
Route::get('/performances/{id}/edit', [PerformanceController::class, 'edit'])->name('performance-edit');
Route::put('/performances/{id}', [PerformanceController::class, 'update'])->name('performance-update');
Route::delete('/performances/{id}', [PerformanceController::class, 'destroy'])->name('performance-destroy');

// Course Recommendation Routes
Route::post('/recommend-course', [CourseRecommendationController::class, 'recommend'])->name('get-recommendation');;
Route::post('/enroll-course', [CourseRecommendationController::class, 'enroll'])->name('courses.enroll');

Route::get('/student/dashboard', [StudentDashboardController::class, 'index'])->middleware(['auth'])->name('student-dashboard');
Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'verified']) 
    ->name('admin-dashboard');

// Certificate Routes
Route::get('/certificate/issue/{user}/{course}', [CertificateController::class, 'issueCertificate'])->name('issue.certificate');
Route::get('/certificate/verify/{certificate}', [CertificateController::class, 'verify'])->name('verify.certificate');

