package com.capstone.practice_pal_engine.utils;

public class PromptGenerator {
    static public String coursePrompt(String courseName, String level) {
        return "You are a JSON-generating function. Do NOT include any text outside the JSON.\n" +
                "Generate a course on " + courseName + " at " + level + " level. " +
                "Return the result as a JSON object that strictly matches the following schema:\n" +
                "{{\n" +
                "  \"title\": \"string\",\n" +
                "  \"description\": \"string\",\n" +
                "  \"category\": \"string\",\n" +
                "  \"topics\": list of string\n" +
                "}}\n" +
                "The title should be the name of the course.\n" +
                "The description should briefly summarize the course content.\n" +
                "The course category, which is the academic discipline of the course " +
                "(e.g Natural Sciences, Formal Sciences, Social Sciences, Humanities, Applied Sciences, or Arts).\n" +
                "The exactly 8 topics array must list each topic, where the name is the topic’s title (no slogans, no extra quotation marks, no subtitles).\n" +
                "Strict rules:\n" +
                "- Follow the JSON structure exactly as shown.\n" +
                "- Do NOT wrap the JSON in markdown (e.g., ```json).\n" +
                "- The response MUST be pure JSON — parsable and without formatting issues.\n" +
                "- The response MUST start with and end with curly brackets.\n" +
                "- Do not include any additional fields or properties.\n" +
                "- Do NOT include comments, explanations, notes, or any text outside the JSON.\n" +
                "- If the response violates any rule, it will be rejected.";
    }

    static public String testPrompt(String courseName, String difficulty, String topics, int index ) {
        return "You are a JSON-generating function. Do NOT include any text outside the JSON. Just return the JSON data ONLY!\n" +
                "Generate a multiple-choice test for the course titled: \"" + courseName + "\".\n" +
                (index > 1 ? "Ensure all questions and answers differ from previous sets.\n" : "") +
                "The test must contain exactly five unique questions covering these topics: " + topics + ".\n" +
                "Each question may be story-based, conceptual, or direct and must be " + difficulty + " in difficulty.\n\n" +

                "Return this exact JSON structure:\n" +
                "{{\n" +
                "  \"questions\": [\n" +
                "    {{\n" +
                "      \"index\": integer,      // Ensure the index starts at " + index + "\n" +
                "      \"stem\": \"string\",\n" +
                "      \"options\": [\"string\", \"string\", \"string\", \"string\"],\n" +
                "      \"answer\": \"string\"\n" +
                "    }}\n" +
                "  ]\n" +
                "}}\n\n" +

                "Rules:\n" +
                "- Each question must have exactly 4 distinct options.\n" +
                "- The answer must exactly match one of the options.\n" +
                "- Follow the JSON structure exactly as shown.\n" +
                "- Do NOT wrap the JSON in markdown (e.g., ```json).\n" +
                "- The response MUST be pure JSON — parsable and without formatting issues.\n" +
                "- The response MUST start with and end with curly brackets.\n" +
                "- Do not include any additional fields or properties.\n" +
                "- Do not add extra formatting like slogans, quotes, or taglines.\n" +
                "- Do NOT include comments, explanations, notes, or any text outside the JSON.\n" +
                "- Do NOT tell me what you did or how you did it, all I want is a JSON response I specified.\n" +
                "- If the response violates any rule, it will be rejected.";
    }

    static public String testPrompt(int noOfQuestions, String courseName, String difficulty, String topics) {
        return "You are a JSON-generating function. Do NOT include any text outside the JSON. Just return the JSON data ONLY!\n" +
                "Generate a multiple-choice test for the course titled: \"" + courseName + "\".\n" +
                "The test must contain exactly " + noOfQuestions + " unique questions covering these topics: " + topics + ".\n" +
                "Each question may be story-based, conceptual, or direct and must be " + difficulty + " in difficulty.\n\n" +

                "Return this exact JSON structure:\n" +
                "{{\n" +
                "  \"questions\": [\n" +
                "    {{\n" +
                "      \"index\": integer,\n" +
                "      \"stem\": \"string\",\n" +
                "      \"options\": [\"string\", \"string\", \"string\", \"string\"],\n" +
                "      \"answer\": \"string\"\n" +
                "    }}\n" +
                "  ]\n" +
                "}}\n\n" +

                "Rules:\n" +
                "- Each question must have exactly 4 distinct options.\n" +
                "- The answer must exactly match one of the options.\n" +
                "- Follow the JSON structure exactly as shown.\n" +
                "- Do NOT wrap the JSON in markdown (e.g., ```json).\n" +
                "- The response MUST be pure JSON — parsable and without formatting issues.\n" +
                "- The response MUST start with and end with curly brackets.\n" +
                "- Do not include any additional fields or properties.\n" +
                "- Do not add extra formatting like slogans, quotes, or taglines.\n" +
                "- Do NOT include comments, explanations, notes, or any text outside the JSON.\n" +
                "- Do NOT tell me what you did or how you did it, all I want is a JSON response I specified.\n" +
                "- If the response violates any rule, it will be rejected.";
    }

}
