<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    public function issueCertificate(User $user, Course $course)
{
    $allTopics = $course->contents->flatMap->topics;
    $completedTopics = $user->completedTopics()->whereIn('topic_id', $allTopics->pluck('id'))->count();

    $passedQuizzes = $user->results()
        ->whereIn('quiz_id', $course->quizzes->pluck('id'))
        ->where('passed', true)
        ->count();

    if ($completedTopics == $allTopics->count() && $passedQuizzes == $course->quizzes->count()) {
        // Generate certificate
        $certificatePath = $this->generateCertificatePDF($user, $course);

        Certificate::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'certificate_number' => uniqid('CERT-'),
            'file_path' => $certificatePath,
            'issued_at' => now(),
        ]);

        return back()->with('success', 'Certificate issued successfully.');
    }

    return back()->with('error', 'Course not yet completed.');
}



public function generateCertificatePDF($user, $course)
{
    $pdf = Pdf::loadView('certificates.template', compact('user', 'course'));
    $fileName = 'certificates/' . uniqid('cert_') . '.pdf';
    Storage::put("public/$fileName", $pdf->output());
    return "storage/$fileName";
}

public function verify($certificateNumber)
{
    $certificate = Certificate::where('certificate_number', $certificateNumber)->firstOrFail();
    return view('certificates.verify', compact('certificate'));
}


}
