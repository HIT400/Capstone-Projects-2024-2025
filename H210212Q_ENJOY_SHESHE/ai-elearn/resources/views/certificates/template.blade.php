<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
        }
        .certificate {
            width: 100%;
            height: 100%;
            padding: 60px;
            text-align: center;
            position: relative;
            border: 10px solid #1e40af;
            box-sizing: border-box;
        }
        .certificate h1 {
            font-size: 48px;
            margin-bottom: 0;
            color: #1e3a8a;
        }
        .certificate h2 {
            font-size: 24px;
            margin-top: 5px;
            color: #4b5563;
        }
        .certificate p {
            font-size: 18px;
            margin: 20px 0;
            color: #374151;
        }
        .certificate .details {
            margin-top: 50px;
        }
        .certificate .signature {
            position: absolute;
            bottom: 60px;
            left: 60px;
            font-size: 16px;
            color: #6b7280;
        }
        .certificate .date {
            position: absolute;
            bottom: 60px;
            right: 60px;
            font-size: 16px;
            color: #6b7280;
        }
        .certificate .qrcode {
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>Certificate of Completion</h1>
        <h2>This is to certify that</h2>
        <p style="font-size: 28px; font-weight: bold;">{{ $user->name }}</p>
        <p>has successfully completed the course</p>
        <p style="font-size: 24px; font-weight: 600;">“{{ $course->title }}”</p>
        <div class="details">
            <p>Issued by AI-Enhanced E-Learning Platform</p>
            <p>Certificate No: <strong>{{ $certificate->certificate_number }}</strong></p>
        </div>
        <div class="signature">_______________________<br>Director, E-Learning</div>
        <div class="date">Issued on: {{ \Carbon\Carbon::parse($certificate->issued_at)->format('F d, Y') }}</div>

        <div class="qrcode">
            {!! QrCode::size(80)->generate(route('verify.certificate', ['certificate' => $certificate->certificate_number])) !!}
        </div>
    </div>
</body>
</html>
