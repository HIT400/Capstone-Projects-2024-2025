from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import json

class User(AbstractUser):
    """
    Base user model that extends Django's AbstractUser
    All users share these common fields
    """
    STUDENT = 'student'
    TEACHER = 'teacher'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (STUDENT, 'Student'),
        (TEACHER, 'Teacher'),
        (ADMIN, 'Admin'),
    ]
    
    # Fix the reverse accessor clash by adding related_name attributes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='management_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='management_user_set',
        related_query_name='user',
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=STUDENT)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    
    # No need to redefine these as they're already in AbstractUser
    # date_joined = models.DateTimeField(auto_now_add=True)
    # last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class Student(models.Model):
    """
    Student profile with additional student-specific fields
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    grade_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    avatar = models.CharField(max_length=100, null=True, blank=True)  # For VR/AR avatar selection
    total_study_time = models.DurationField(default=timezone.timedelta)
    achievements = models.ManyToManyField('Achievement', blank=True, related_name='students')
    
    def __str__(self):
        return f"Student: {self.user.username} (Grade {self.grade_level})"


class Teacher(models.Model):
    """
    Teacher profile with additional teacher-specific fields
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"Teacher: {self.user.username} ({self.specialization})"


class ChemistrySubject(models.Model):
    """
    Chemistry subjects/topics that can be learned and tested
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    difficulty_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    parent_subject = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                       related_name='sub_subjects')
    ar_model_path = models.CharField(max_length=255, null=True, blank=True)  # Path to AR models
    vr_scene_path = models.CharField(max_length=255, null=True, blank=True)  # Path to VR scenes
    
    def __str__(self):
        return self.name


class Question(models.Model):
    """
    Questions for assessments and tests
    """
    MULTIPLE_CHOICE = 'multiple_choice'
    TRUE_FALSE = 'true_false'
    SHORT_ANSWER = 'short_answer'
    INTERACTIVE_3D = 'interactive_3d'
    MOLECULE_BUILDING = 'molecule_building'
    EXPERIMENT = 'experiment'
    
    QUESTION_TYPE_CHOICES = [
        (MULTIPLE_CHOICE, 'Multiple Choice'),
        (TRUE_FALSE, 'True/False'),
        (SHORT_ANSWER, 'Short Answer'),
        (INTERACTIVE_3D, 'Interactive 3D'),
        (MOLECULE_BUILDING, 'Molecule Building'),
        (EXPERIMENT, 'Virtual Experiment'),
    ]
    
    subject = models.ForeignKey(ChemistrySubject, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    difficulty = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    points = models.IntegerField(default=1)
    
    # For multiple choice questions
    choices = models.JSONField(null=True, blank=True)
    correct_answer = models.CharField(max_length=255)
    
    # For interactive questions
    ar_content_path = models.CharField(max_length=255, null=True, blank=True)
    vr_content_path = models.CharField(max_length=255, null=True, blank=True)
    interaction_data = models.JSONField(null=True, blank=True)  # Store interaction parameters
    
    explanation = models.TextField(blank=True)  # Explanation for the correct answer
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_questions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.question_text[:50]}... ({self.get_question_type_display()})"


class Assessment(models.Model):
    """
    Assessment model for formal evaluations
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(ChemistrySubject, on_delete=models.CASCADE, related_name='assessments')
    questions = models.ManyToManyField(Question, related_name='assessments')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_assessments')
    time_limit = models.DurationField(null=True, blank=True)  # Optional time limit
    passing_score = models.IntegerField(default=60)  # Percentage
    max_attempts = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    uses_ar = models.BooleanField(default=False)
    uses_vr = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title
        
    def total_points(self):
        return sum(question.points for question in self.questions.all())


class GameAssessment(models.Model):
    """
    Game-based assessment with interactive elements
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(ChemistrySubject, on_delete=models.CASCADE, related_name='game_assessments')
    questions = models.ManyToManyField(Question, related_name='game_assessments')
    game_type = models.CharField(max_length=100)  # e.g., "molecule_builder", "lab_simulation"
    difficulty_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    time_limit = models.DurationField(null=True, blank=True)
    environment_path = models.CharField(max_length=255)  # Path to the game environment
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_games')
    max_points = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.game_type})"


class StudentAssessmentAttempt(models.Model):
    """
    Record of a student's attempt at an assessment
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assessment_attempts')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='student_attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    
    # Store the answers, failed questions, and correct questions as JSON
    answers = models.JSONField(default=dict)
    failed_questions = models.JSONField(default=list)
    correct_questions = models.JSONField(default=list)
    
    feedback = models.TextField(blank=True)
    time_taken = models.DurationField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.user.username}'s attempt on {self.assessment.title}"
    
    def save(self, *args, **kwargs):
        if self.completed and self.end_time and self.start_time:
            self.time_taken = self.end_time - self.start_time
        super().save(*args, **kwargs)


class StudentGameAttempt(models.Model):
    """
    Record of a student's attempt at a game assessment
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='game_attempts')
    game = models.ForeignKey(GameAssessment, on_delete=models.CASCADE, related_name='student_attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    
    # Game-specific data
    answers = models.JSONField(default=dict)
    failed_questions = models.JSONField(default=list)
    correct_questions = models.JSONField(default=list)
    
    # Track interactions in the game
    interaction_data = models.JSONField(default=dict)  # Stores user interactions within the game
    progression_path = models.JSONField(default=list)  # Track the path taken through the game
    
    time_taken = models.DurationField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.user.username}'s game attempt on {self.game.title}"
    
    def save(self, *args, **kwargs):
        if self.completed and self.end_time and self.start_time:
            self.time_taken = self.end_time - self.start_time
        super().save(*args, **kwargs)


class StudentProgress(models.Model):
    """
    Overall progress tracking for a student across subjects
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='progress')
    subject = models.ForeignKey(ChemistrySubject, on_delete=models.CASCADE, related_name='student_progress')
    proficiency_level = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    assessments_completed = models.IntegerField(default=0)
    games_completed = models.IntegerField(default=0)
    total_study_time = models.DurationField(default=timezone.timedelta)
    last_activity = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.user.username}'s progress in {self.subject.name}"


class Achievement(models.Model):
    """
    Gamification achievements that students can earn
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='achievements/')
    requirement = models.TextField()  # Description of how to earn this achievement
    points = models.IntegerField(default=0)
    
    # Achievement type
    is_assessment_related = models.BooleanField(default=False)
    is_game_related = models.BooleanField(default=False)
    is_time_related = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name


class ClassGroup(models.Model):
    """
    Class groups managed by teachers
    """
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='classes')
    students = models.ManyToManyField(Student, related_name='enrolled_classes')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} (by {self.teacher.user.username})"


class AssignmentSchedule(models.Model):
    """
    Scheduled assignments for class groups
    """
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE, related_name='assignments')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, null=True, blank=True)
    game_assessment = models.ForeignKey(GameAssessment, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_date = models.DateTimeField()
    due_date = models.DateTimeField()
    is_required = models.BooleanField(default=True)
    points = models.IntegerField(default=0)
    
    def __str__(self):
        assessment_name = self.assessment.title if self.assessment else self.game_assessment.title
        return f"{self.title} - {assessment_name} for {self.class_group.name}"


class ARVRSession(models.Model):
    """
    Tracks usage of AR/VR equipment and sessions
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='ar_vr_sessions')
    subject = models.ForeignKey(ChemistrySubject, on_delete=models.CASCADE, related_name='ar_vr_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    session_type = models.CharField(max_length=10, choices=[('AR', 'Augmented Reality'), ('VR', 'Virtual Reality')])
    device_used = models.CharField(max_length=100)
    total_interactions = models.IntegerField(default=0)
    session_data = models.JSONField(default=dict)  # Store interaction data
    duration = models.DurationField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.user.username}'s {self.session_type} session on {self.start_time.date()}"
    
    def save(self, *args, **kwargs):
        if self.end_time and self.start_time:
            self.duration = self.end_time - self.start_time
        super().save(*args, **kwargs)


class Notification(models.Model):
    """
    System notifications for users
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    # Notification types
    ASSESSMENT = 'assessment'
    ACHIEVEMENT = 'achievement'
    REMINDER = 'reminder'
    FEEDBACK = 'feedback'
    SYSTEM = 'system'
    
    NOTIFICATION_TYPES = [
        (ASSESSMENT, 'Assessment'),
        (ACHIEVEMENT, 'Achievement'),
        (REMINDER, 'Reminder'),
        (FEEDBACK, 'Feedback'),
        (SYSTEM, 'System'),
    ]
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    related_link = models.URLField(blank=True, null=True)  # Link to related resource
    
    def __str__(self):
        return f"{self.notification_type}: {self.title} for {self.user.username}"


class AnalyticsData(models.Model):
    """
    Analytics data collection model
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(auto_now_add=True)
    total_study_time = models.DurationField(default=timezone.timedelta)
    assessments_taken = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    average_score = models.FloatField(null=True, blank=True)
    ar_time = models.DurationField(default=timezone.timedelta)
    vr_time = models.DurationField(default=timezone.timedelta)
    progress_data = models.JSONField(default=dict)  # Detailed progress data
    
    class Meta:
        unique_together = ('student', 'date')
        
    def __str__(self):
        return f"Analytics for {self.student.user.username} on {self.date}"