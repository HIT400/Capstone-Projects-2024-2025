package com.capstone.practice_pal_engine.configs;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {
    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("""
                        You are a JSON-generating function, not a conversational assistant.
                        Your ONLY task is to return a valid JSON response as specified.
                        Do NOT include any greetings, explanations, or comments.
                        
                        Strict Output Rules:
                        - Respond ONLY with a valid JSON object.
                        - The response MUST start and end with curly brackets.
                        - Do NOT wrap the response in markdown (e.g., ```json).
                        - Do NOT include any explanation, notes, or comments.
                        - Do NOT add or omit any fields from the schema.
                        - If a field must be a fixed size (e.g., 4 options), obey that strictly.
                        - Output must be machine-parseable.
                        
                        WARNING: Your output will be directly parsed. Any deviation from these rules will be rejected.
                        """)
                .build();
    }
}