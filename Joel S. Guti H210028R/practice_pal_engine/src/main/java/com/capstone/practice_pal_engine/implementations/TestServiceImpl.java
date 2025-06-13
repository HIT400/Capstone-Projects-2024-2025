package com.capstone.practice_pal_engine.implementations;

import com.capstone.practice_pal_engine.deepseek.DeepSeekClient;
import com.capstone.practice_pal_engine.deepseek.DeepSeekModels;
import com.capstone.practice_pal_engine.dto.requests.GenerateTestRequest;
import com.capstone.practice_pal_engine.dto.requests.TakeTestRequest;
import com.capstone.practice_pal_engine.dto.response.TestAIResponse;
import com.capstone.practice_pal_engine.dto.response.TestDetailsResponse;
import com.capstone.practice_pal_engine.models.*;
import com.capstone.practice_pal_engine.repositories.CourseRepository;
import com.capstone.practice_pal_engine.repositories.TestRepository;
import com.capstone.practice_pal_engine.repositories.TestResultsRepository;
import com.capstone.practice_pal_engine.services.TestService;
import com.capstone.practice_pal_engine.utils.PracticePalConstants;
import com.capstone.practice_pal_engine.utils.PromptGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {
    private final TestRepository testRepository;
    private final CourseRepository courseRepository;
    private final TestResultsRepository testResultsRepository;
    private final ChatClient chatClient;

    @Override
    @Transactional
    public List<Test> getTests() {
        var user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return testRepository.findByUser(user);
    }

    @Override
    @Transactional
    public Test getTestById(Long testId) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return testRepository.findByIdAndUser(testId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test was not found!"));
    }

    @Override
    @Transactional
    public List<TestResults> getAllTestResults() {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return testResultsRepository.findByUser(user);
    }

    @Override
    public TestResults getTestResults(Long testId) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return testResultsRepository.findByIdAndUser(testId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test results not found!"));
    }

    @Override
    public Test generate(GenerateTestRequest request) {
        var course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        var topics = request.getTopics().stream().map(Topic::name).toList();

        if (topics.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No topics where selected");

        List<Question> questions = new ArrayList<>(List.of());

        int count = 0;
        while (count < (request.getNoOfQuestions() / 5)) {
            try {
                var prompt = PromptGenerator.testPrompt(course.getTitle(), request.getDifficulty().toString(), String.join(", ", topics), ((5 * count) + 1));
                var response = chatClient
                        .prompt()
                        .user(prompt)
                        .call()
                        .entity(TestAIResponse.class);
                System.out.println("TEST RESPONSE: " + response);
                assert response != null;
                if (response.questions() != null) {
                    List<Question> validQuestions = response.questions().stream()
                            .filter(q -> q.getOptions() != null && q.getOptions().size() == 4)
                            .filter(q -> q.getOptions().contains(q.getAnswer()))
                            .toList();
                    questions.addAll(validQuestions);
                    ++count;
                }
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate test!");
            }
        }

        if (questions.isEmpty())
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No valid questions where generated!");

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return testRepository.save(Test.builder()
                .title(request.getTestName())
                .difficulty(request.getDifficulty())
                .createdAt(new Date())
                .course(course)
                .questions(questions)
                .user(user)
                .build());
    }

    @Override
    public Test pastPapers(GenerateTestRequest request) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        var course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course was not found!"));

        var tests = course.getTests();
        List<Question> questions = new ArrayList<>(List.of());

        if (tests.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No tests where found!");

        List<Question> allQuestions = tests.stream()
                .flatMap(test -> test.getQuestions().stream())
                .toList();

        Set<String> uniqueStems = allQuestions.stream()
                .map(Question::getStem)
                .collect(Collectors.toSet());

        if (uniqueStems.size() <= request.getNoOfQuestions()) {
            List<Question> uniqueList = uniqueStems.stream()
                    .map(stem -> allQuestions.stream().filter(q -> q.getStem().equals(stem)).findFirst().get())
                    .collect(Collectors.toList());

            Collections.shuffle(uniqueList);
            questions.addAll(uniqueList.stream()
                    .limit(uniqueStems.size())
                    .map(q -> new Question(questions.size() + 1, q.getStem(), q.getOptions(), q.getAnswer()))
                    .toList());
        } else {
            // ALGORITHM: GREEDY SELECTION + RANDOM WALK
            for (var test : tests) {
                if (questions.size() == request.getNoOfQuestions()) break;
                if (test.getQuestions().isEmpty()) continue;

                var question = test.getQuestions().get(RandomUtils.nextInt(0, test.getQuestions().size() - 1));
                if (!(questions.stream().map(Question::getStem)).toList().contains(question.getStem())) {
                    questions.add(new Question(questions.size() + 1, question.getStem(), question.getOptions(), question.getAnswer()));
                }
            }

            while (questions.size() < request.getNoOfQuestions()) {
                var question = allQuestions.get(RandomUtils.nextInt(0, allQuestions.size() - 1));
                if (!(questions.stream().map(Question::getStem)).toList().contains(question.getStem())) {
                    questions.add(new Question(questions.size() + 1, question.getStem(), question.getOptions(), question.getAnswer()));
                }
            }
        }

        if (questions.size() != request.getNoOfQuestions())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient number of questions found!");

        return testRepository.save(Test.builder()
                .title(request.getTestName())
                .difficulty(request.getDifficulty())
                .createdAt(new Date())
                .course(course)
                .questions(questions)
                .user(user)
                .build());
    }

    @Override
    public TestResults attemptTest(TakeTestRequest request) {
        var test = testRepository.findById(request.getTestId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test was not found!"));

        var totalQuestions = test.getQuestions().size();
        var totalAnswered = request.getResponses().size();
        var totalUnanswered = totalQuestions - totalAnswered;

        int totalCorrectAnswers = 0;
        Map<Integer, String> answerMap = test.getQuestions().stream()
                .collect(Collectors.toMap(
                        Question::getIndex,
                        Question::getAnswer
                ));

        for (var response : request.getResponses()) {
            String correctAnswer = answerMap.get(response.id().intValue());
            if (correctAnswer != null && correctAnswer.equals(response.answer())) {
                ++totalCorrectAnswers;
            }
        }

        List<Answer> givenAnswers = request.getResponses()
                .stream()
                .map((answer) -> new Answer(answer.id(), answer.answer()))
                .toList();

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return testResultsRepository.save(TestResults.builder()
                .title("Test Results on " + test.getTitle())
                .test(test)
                .totalQuestions(totalQuestions)
                .totalAnswered(totalAnswered)
                .totalUnanswered(totalUnanswered)
                .totalCorrectAnswers(totalCorrectAnswers)
                .score(BigDecimal.valueOf(((double) totalCorrectAnswers / totalQuestions) * 100)
                        .setScale(2, RoundingMode.HALF_UP))
                .date(new Date())
                .givenAnswers(givenAnswers)
                .user(user)
                .build());
    }

    @Override
    @Transactional
    public Object reviseTest(Long resultId) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        TestResults results = testResultsRepository.findByIdAndUser(resultId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test results not found!"));
        var test = testRepository.findById(results.getTestId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found!"));

        return new ReviseTest(test, results.getGivenAnswers(), results.getTotalCorrectAnswers(), results.getTotalQuestions());
    }

    @Override
    @Transactional
    public TestDetailsResponse getTestDetails(Long testId) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        var test = testRepository.findByIdAndUser(testId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test was not found!"));
        return TestDetailsResponse.builder()
                .id(test.getId())
                .title(test.getTitle())
                .difficulty(test.getDifficulty())
                .createdAt(test.getCreatedAt())
                .results(test.getResults())
                .build();
    }

}
