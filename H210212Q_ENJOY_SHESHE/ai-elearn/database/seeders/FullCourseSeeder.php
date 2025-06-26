<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Content;
use App\Models\Topic;
use App\Models\Quiz;
use App\Models\Answer;

class FullCourseSeeder extends Seeder
{
    public function run(): void
    {
        // MOBILE APP DEVELOPMENT
        $mobileAppCourse = Course::create([
            'name' => 'Mobile App Development',
            'description' => 'Learn how to build mobile apps for Android and iOS devices.',
            'difficulty_level' => 'Intermediate',
            'status' => 'Active',
        ]);
        $mobileTopic = Topic::create([
            'course_id' => $mobileAppCourse->id,
            'title' => 'Introduction to Mobile App Development',
            'difficulty_level' => 'Beginner',
            'status' => 'Active',
        ]);


        $mobileContent = Content::create([
            'topic_id' => $mobileTopic->id,
            'title' => 'Getting Started with Mobile App Development',
            'description' => 'Fundamentals of mobile development including platforms, tools, and user experience.',
            'notes' => 'Mobile app development involves designing and creating applications that run on mobile devices. Developers must optimize for small screens, touch interfaces, and battery usage while delivering a seamless and engaging user experience. Applications can be native, built specifically for Android (Java/Kotlin) or iOS (Swift/Objective-C), or cross-platform using tools like Flutter or React Native. Developers must also consider app store guidelines, performance tuning, user feedback integration, and device compatibility. Understanding mobile UI/UX principles, using APIs for services like maps or notifications, and securing data communication are essential skills for mobile developers.',
            'status' => 'Active',
        ]);

       

        $this->addQuestions($mobileTopic->id, $mobileAppCourse->id, [
            [
                'question' => 'What defines a native mobile app?',
                'options' => ['App built with a cross-platform tool', 'App developed for a specific mobile OS', 'Website designed for mobile browsers', 'Software for desktop devices'],
                'correct' => 1,
            ],

            [
                'question' => 'Which language is primarily used for iOS app development?',
                'options' => ['Kotlin', 'Java', 'Swift', 'Dart'],
                'correct' => 2,
            ],
            [
                'question' => 'Flutter is mainly used for:',
                'options' => ['Backend development', 'Cross-platform mobile app development', 'Website building', 'Database management'],
                'correct' => 1,
            ],
            [
                'question' => 'A critical part of mobile app development is optimizing for:',
                'options' => ['Desktop screen resolutions', 'Large physical keyboards', 'Battery life and performance', 'Wired internet speed'],
                'correct' => 2,
            ],
            [
                'question' => 'Which mobile app store is exclusive to iOS devices?',
                'options' => ['Google Play Store', 'Apple App Store', 'Amazon Appstore', 'Microsoft Store'],
                'correct' => 1,
            ],
        ]);

        // Repeat similarly for the other courses
        $this->createCourseWithContentAndTopic(
            'Game Development',
            'Introduction to Game Development',
            'Game development involves creating interactive digital experiences for entertainment, education, or training purposes. It combines art, storytelling, programming, and design to craft immersive environments. Key components include game design (rules, mechanics), development (coding the logic), graphics and animation, sound engineering, and user experience. Games are developed for different platforms like consoles, PC, mobile, and VR devices, using engines like Unity, Unreal Engine, or Godot. Understanding player engagement, optimization for performance, and iterative design/testing is critical in producing successful games.',
            [
                [
                    'question' => 'What is the primary goal of game development?',
                    'options' => ['Designing social media websites', 'Creating interactive digital experiences', 'Programming mobile banking apps', 'Developing desktop utilities'],
                    'correct' => 1,
                ],
                [
                    'question' => 'Which tool is most commonly used for 3D game development?',
                    'options' => ['Photoshop', 'Microsoft Excel', 'Unity', 'Notepad'],
                    'correct' => 2,
                ],
                [
                    'question' => 'In game development, what does "mechanics" refer to?',
                    'options' => ['The characters\' appearance', 'The rules and systems of gameplay', 'The network latency', 'The soundtrack'],
                    'correct' => 1,
                ],
                [
                    'question' => 'Which programming language is often used with Unreal Engine?',
                    'options' => ['Python', 'C++', 'JavaScript', 'Kotlin'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What aspect of game development focuses on creating character animations?',
                    'options' => ['Coding', 'Sound engineering', 'Art and graphics design', 'Level design'],
                    'correct' => 2,
                ],
            ]
        );

        $this->createCourseWithContentAndTopic(
            'Data Science and Machine Learning',
            'Introduction to Data Science',
            'Data Science involves extracting insights from structured and unstructured data through techniques like statistical analysis, machine learning, and data visualization. Data scientists collect, clean, and process data to find trends, build predictive models, and inform decision-making. Core tools include Python, R, SQL, Pandas, Scikit-learn, and visualization libraries like Matplotlib or Seaborn. The Data Science lifecycle typically includes data collection, exploration, modeling, evaluation, and deployment.',
            [
                [
                    'question' => 'What is the main goal of data science?',
                    'options' => ['Manage servers', 'Extract insights and knowledge from data', 'Create mobile apps', 'Build physical hardware'],
                    'correct' => 1,
                ],
                [
                    'question' => 'Which programming language is most commonly associated with data science?',
                    'options' => ['PHP', 'Swift', 'Python', 'Kotlin'],
                    'correct' => 2,
                ],
                [
                    'question' => 'What is the first step in any data science project?',
                    'options' => ['Model evaluation', 'Data cleaning', 'Data collection', 'Visualization'],
                    'correct' => 2,
                ],
                [
                    'question' => 'Which library is primarily used for machine learning in Python?',
                    'options' => ['Flask', 'Scikit-learn', 'Bootstrap', 'Django'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What type of data is text-based and not organized into tables?',
                    'options' => ['Structured data', 'Semi-structured data', 'Unstructured data', 'Relational data'],
                    'correct' => 2,
                ],
            ]
        );

        $this->createCourseWithContentAndTopic(
            'Artificial Intelligence',
            'Introduction to Artificial Intelligence',
            'Artificial Intelligence (AI) is the branch of computer science concerned with building machines that can mimic human intelligence, learning from experience, and performing tasks that typically require human intellect. Subfields of AI include machine learning, natural language processing (NLP), robotics, and computer vision. AI systems are designed to improve over time and can be categorized into Narrow AI (specialized in one task) and General AI (hypothetical systems capable of human-level tasks).',
            [
                [
                    'question' => 'Which is a subfield of Artificial Intelligence?',
                    'options' => ['Database administration', 'Natural Language Processing', 'Cloud computing', 'Web hosting'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What is Narrow AI?',
                    'options' => ['AI that can perform a wide range of tasks', 'AI that can perform a specific task', 'AI that can fix hardware issues', 'AI without learning capability'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What branch of AI helps computers understand human languages?',
                    'options' => ['Computer Vision', 'Natural Language Processing', 'Robotics', 'Expert Systems'],
                    'correct' => 1,
                ],
                [
                    'question' => 'Which of these is a goal of AI?',
                    'options' => ['Build faster hardware', 'Create machines capable of human-like tasks', 'Generate random data', 'Increase internet speed'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What is an example of Narrow AI?',
                    'options' => ['A general-purpose robot', 'Facial recognition system', 'Superintelligent AI', 'Global weather prediction'],
                    'correct' => 1,
                ],
            ]
        );

        $this->createCourseWithContentAndTopic(
            'Machine Learning in AI',
            'Introduction to Machine Learning',
            'Machine Learning (ML) is a subset of AI that enables systems to learn from data and improve without being explicitly programmed. Types of ML include Supervised Learning (learning with labeled data), Unsupervised Learning (finding patterns in unlabeled data), and Reinforcement Learning (learning from actions via rewards or punishments). Common algorithms include decision trees, support vector machines, and neural networks.',
            [
                [
                    'question' => 'What is supervised learning?',
                    'options' => ['Learning from unlabeled data', 'Learning from labeled data', 'Random decision making', 'Learning by mistake'],
                    'correct' => 1,
                ],
                [
                    'question' => 'Which type of learning does NOT require labeled data?',
                    'options' => ['Reinforcement learning', 'Supervised learning', 'Unsupervised learning', 'Deep learning'],
                    'correct' => 2,
                ],
                [
                    'question' => 'Which method is used by autonomous cars to learn to drive?',
                    'options' => ['Reinforcement learning', 'Unsupervised learning', 'Supervised learning', 'Classification'],
                    'correct' => 0,
                ],
                [
                    'question' => 'A neural network is an example of:',
                    'options' => ['Statistical analysis', 'Manual programming', 'Machine Learning model', 'Data encryption'],
                    'correct' => 2,
                ],
                [
                    'question' => 'In machine learning, data used for model training must be:',
                    'options' => ['Always unstructured', 'Stored in blockchain', 'Well-prepared and relevant', 'Randomly generated'],
                    'correct' => 2,
                ],
            ]
        );

        $this->createCourseWithContentAndTopic(
            'Cybersecurity and Networking',
            'Introduction to Cybersecurity',
            'Cybersecurity is the practice of protecting systems, networks, and data from malicious attacks. It includes techniques like risk assessment, data encryption, firewall management, and user authentication. Common cyber threats include malware, phishing attacks, ransomware, and denial-of-service attacks. Effective cybersecurity strategies combine preventive technology (firewalls, antivirus software) and good practices (strong passwords, regular updates).',
            [
                [
                    'question' => 'What is the primary aim of cybersecurity?',
                    'options' => ['Speed up the internet', 'Protect systems and data from threats', 'Develop mobile apps', 'Build computers'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What does encryption do?',
                    'options' => ['Deletes unwanted files', 'Converts data into unreadable form to unauthorized users', 'Destroys viruses', 'Tracks emails'],
                    'correct' => 1,
                ],
                [
                    'question' => 'What device monitors and controls incoming and outgoing network traffic?',
                    'options' => ['Router', 'Firewall', 'Antivirus', 'Switch'],
                    'correct' => 1,
                ],
                [
                    'question' => 'Phishing attacks usually involve:',
                    'options' => ['Social engineering to steal data', 'Hacking a server manually', 'Physical theft of devices', 'Network speed enhancement'],
                    'correct' => 0,
                ],
                [
                    'question' => 'A strong password should include:',
                    'options' => ['Only lowercase letters', 'Common words', 'A mix of letters, numbers, and symbols', 'Birthdates only'],
                    'correct' => 2,
                ],
            ]
        );
    }

    private function addQuestions($courseId,$topicId, array $questions)
    {
        foreach ($questions as $data) {
            $quiz = Quiz::create([
                'course_id' => $courseId,
                'topic_id' => $topicId,
                'question' => $data['question'],
                'status'=> 'Active',
            ]);

            foreach ($data['options'] as $index => $option) {
                Answer::create([
                    'quiz_id' => $quiz->id,
                    'answer_text' => $option,
                    'is_correct' => $index == $data['correct'],
                    'status'=> 'Active',
                ]);
            }
        }
    }

    private function createCourseWithContentAndTopic($courseTitle, $topicTitle, $topicContent, $questions)
    {
        $course = Course::create([
            'name' => $courseTitle,
            'description' => $courseTitle . ' full course description.',
            'difficulty_level' => 'Intermediate',
            'status' => 'Active',
        ]);

        $topic = Topic::create([
            'course_id' => $course->id,
            'title' => $topicTitle,
            'difficulty_level' => 'Beginner',
            'description' => 'Learn about ' . strtolower($topicTitle) . '.',
            'status' => 'Active',
        ]);

        $content = Content::create([
            'title' => $topicTitle,
            'notes' => $topicContent,
            'topic_id' => $topic->id,
            'description' => 'Learn about ' . strtolower($topicTitle) . '.',
            'status' => 'Active',
        ]);

       
        $topic->update(['course_id' => $course->id]);
        $this->addQuestions($course->id,$topic->id, $questions);
    }
}
