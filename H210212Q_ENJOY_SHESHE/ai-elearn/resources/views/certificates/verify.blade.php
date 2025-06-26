<h2 class="text-2xl font-bold">Certificate Verification</h2>

<p><strong>Certificate Number:</strong> {{ $certificate->certificate_number }}</p>
<p><strong>Issued To:</strong> {{ $certificate->user->name }}</p>
<p><strong>Course:</strong> {{ $certificate->course->title }}</p>
<p><strong>Issued On:</strong> {{ $certificate->issued_at->format('F d, Y') }}</p>

<p class="text-green-600 mt-4 font-semibold">✅ This certificate is valid.</p>
