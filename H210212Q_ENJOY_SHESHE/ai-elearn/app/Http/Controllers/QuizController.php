<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Grade;
use App\Models\Topic;
use App\Models\Result;
use App\Models\QuizResult;
use App\Models\Performance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    public function index()
    {
        $quizzes = Quiz::with('topic')->get();
        return response()->json($quizzes);
    }

    public function create()
    {
        $topics = Topic::all();
        return view('quizzes.create', compact('topics'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required',
            'topic_id' => 'required|exists:topics,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        $quiz = Quiz::create($request->all());

        return response()->json(['message' => 'Quiz created successfully', 'quiz' => $quiz], 201);
    }

    public function show($id)
    {
        $quiz = Quiz::with('topic')->findOrFail($id);
        return response()->json($quiz);
    }

    public function edit($id)
    {
        $quiz = Quiz::findOrFail($id);
        $topics = Topic::all();
        return view('quizzes.edit', compact('quiz', 'topics'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'question' => 'required',
            'topic_id' => 'required|exists:topics,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        $quiz = Quiz::findOrFail($id);
        $quiz->update($request->all());

        return response()->json(['message' => 'Quiz updated successfully', 'quiz' => $quiz]);
    }

    public function destroy($id)
    {
        Quiz::findOrFail($id)->delete();
        return response()->json(['message' => 'Quiz deleted successfully']);
    }

    public function showTopicQuiz($id)
{
    $topic = Topic::with('quizzes.answers')->findOrFail($id);
    return view('quizzes.take', compact('topic'));
}

public function submitTopicQuiz(Request $request, $id)
{
    $topic = Topic::findOrFail($id);
    $quizzes = Quiz::where('topic_id', $id)->with('answers')->get();

    $score = 0;
    $total = count($quizzes);

    $quizResultsData = [];

    foreach ($quizzes as $quiz) {
        $userAnswerId = $request->input("quiz_{$quiz->id}");
        $correctAnswer = $quiz->answers->where('is_correct', true)->first();

        $isCorrect = ($correctAnswer && $userAnswerId == $correctAnswer->id);
        if ($isCorrect) {
            $score++;
        }

        $quizResultsData[] = [
            'quiz_id'   => $quiz->id,
            'answer_id' => $userAnswerId,
            'is_correct'=> $isCorrect,
        ];
    }

    $percentage = ($total > 0) ? ($score / $total) * 100 : 0;

    $grade = Grade::where('min_score', '<=', $percentage)
                  ->where('max_score', '>=', $percentage)
                  ->first();

    // Check if result already exists for this user and topic
    $existingResult = Result::where('user_id', auth()->id())
                            ->where('quiz_id', $quizzes->first()->id)
                            ->first();

    if ($existingResult) {
        // Update result
        $existingResult->update([
            'score'       => $score,
            'total_score' => $total,
            'grade_id'    => $grade->id ?? null,
        ]);

        $result = $existingResult;
    } else {
        // Create new result
        $result = Result::create([
            'user_id'     => auth()->id(),
            'quiz_id'     => $quizzes->first()->id,
            'total_score' => $total,
            'score'       => $score,
            'grade_id'    => $grade->id ?? null,
            'status'      => 'Active',
        ]);
    }

    // Save or update each quiz_result
    foreach ($quizResultsData as $data) {
        auth()->user()->quizResults()->updateOrCreate(
            [
                'result_id' => $result->id,
                'quiz_id'   => $data['quiz_id'],
            ],
            [
                'topic_id'  => $topic->id,
                'answer_id' => $data['answer_id'],
                'is_correct'=> $data['is_correct'],
            ]
        );
    }

    $progress = Performance::updateOrCreate(
        ['user_id' => auth()->id(), 'topic_id' => $topic->id],
        [
            'status'     => 'Completed',
            'last_score' => round($percentage, 2),
        ]
    );
    
    // Increment attempts if it's an update
    if (!$progress->wasRecentlyCreated) {
        $progress->increment('attempts');
    }

    // return redirect()->route('topic-show', $id)
    //                  ->with('success', "You scored $score out of $total (" . round($percentage) . "%) and got grade: {$grade->grade_letter}");

    return redirect()->route('quiz-report', $topic->id)
                 ->with('success', "You scored $score out of $total (" . round($percentage) . "%) and got grade: {$grade->grade_letter}");
}
public function attempt($quizId)
{

    $quiz = Quiz::with('answers', 'topic')->findOrFail($quizId);
    $topic = $quiz->topic;
    return view('quizzes.take', compact('quiz', 'topic'));
}


public function studentIndex()
{
    $user = Auth::user();

    // Load courses with topics only
    $courses = $user->courses()->with('topics')->get();

    return view('student.quizzes.index', compact('courses'))->with('success', 'Quizzes loaded successfully');
}

public function showQuizReport($topicId)
{
    $userId = auth()->id();
    $topic = Topic::with('quizzes.answers')->findOrFail($topicId);
    
    $firstQuiz = $topic->quizzes->first();

    if (!$firstQuiz) {
        return redirect()->back()->with('error', 'No quizzes available for this topic.');
    }

    $result = Result::where('user_id', $userId)
                    ->where('quiz_id', $firstQuiz->id)
                    ->with('grade')
                    ->first();

    if (!$result) {
        return redirect()->back()->with('error', 'You must complete the quiz before viewing the report.');
    }

    $quizResults = QuizResult::where('result_id', $result->id)
                    ->with('quiz.answers')
                    ->get();

    $performance = Performance::where('user_id', $userId)
                              ->where('topic_id', $topic->id)
                              ->first();

    $recommendations = $quizResults->filter(fn($qr) => !$qr->is_correct)
                                   ->pluck('quiz.question')
                                   ->map(fn($q) => "Review: \"$q\"")
                                   ->unique();

    return view('student.quiz-report', compact('topic', 'result', 'quizResults', 'performance', 'recommendations'));
}




}
