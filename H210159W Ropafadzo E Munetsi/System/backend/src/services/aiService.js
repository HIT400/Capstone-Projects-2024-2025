import OpenAI from 'openai';

// Anthropic Inference API configuration via OpenAI client
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

// Log configuration status (without exposing the token)
console.log(`AI Service Configuration: Using ${modelName} model at ${endpoint}`);
console.log(`API Key available: ${!!token}`);

/**
 * Roughly estimate token count for a string
 * This is a very simple estimation (about 4 chars per token)
 * @param {string} text - The text to estimate tokens for
 * @returns {number} - Estimated token count
 */
function estimateTokenCount(text) {
  // A very rough estimate - about 4 characters per token for English text
  return Math.ceil(text.length / 4);
}

/**
 * Extract key sections from document text to fit within token limit
 * @param {string} text - The full document text
 * @param {number} maxTokens - Maximum tokens allowed
 * @returns {string} - Extracted key sections
 */
function extractKeyContentForAI(text, maxTokens = 7000) {
  // Reserve 1000 tokens for the system message and other parts of the request
  const textTokenLimit = maxTokens - 1000;

  // If text is already within limit, return as is
  if (estimateTokenCount(text) <= textTokenLimit) {
    return text;
  }

  // Extract key sections that are most likely to contain important information
  const sections = [];

  // Extract section titles and their content
  const sectionPattern = /\n([A-Z][A-Z\s]+:?|[0-9]+\.[0-9]+\s+[A-Z][A-Za-z\s]+)\n/g;
  let match;
  const sectionMatches = [];

  // Find all section headers
  while ((match = sectionPattern.exec(text)) !== null) {
    sectionMatches.push({
      title: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  // Extract content for each section (limited to 500 chars per section)
  for (let i = 0; i < sectionMatches.length; i++) {
    const section = sectionMatches[i];
    const nextSection = sectionMatches[i + 1];
    const endIndex = nextSection ? nextSection.startIndex : Math.min(section.endIndex + 500, text.length);

    // Get section content
    const sectionContent = text.substring(section.startIndex, endIndex);
    sections.push(sectionContent);
  }

  // If no sections were found, extract key paragraphs based on keywords
  if (sections.length === 0) {
    const keyPhrases = [
      'height', 'dimension', 'room', 'ceiling', 'floor', 'area', 'building',
      'wall', 'window', 'door', 'safety', 'compliance', 'regulation', 'standard',
      'requirement', 'minimum', 'maximum', 'measurement', 'specification'
    ];

    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/);

    // Score paragraphs based on keyword density
    const scoredParagraphs = paragraphs.map(para => {
      const lowerPara = para.toLowerCase();
      const score = keyPhrases.reduce((count, phrase) => {
        return count + (lowerPara.includes(phrase) ? 1 : 0);
      }, 0);
      return { text: para, score };
    });

    // Sort by score and take top paragraphs
    scoredParagraphs.sort((a, b) => b.score - a.score);
    const topParagraphs = scoredParagraphs.slice(0, 10).map(p => p.text);
    sections.push(...topParagraphs);
  }

  // Combine sections and ensure we're within token limit
  let combinedText = sections.join('\n\n');

  // If still too long, truncate
  if (estimateTokenCount(combinedText) > textTokenLimit) {
    combinedText = combinedText.substring(0, textTokenLimit * 4);
  }

  return combinedText;
}


/**
 * Checks document text for compliance with building standards using AI
 * @param {string} text - The extracted text from the document
 * @returns {Promise<{issues: string[], warnings: string[], suggestions: string[], error: string|null}>}
 */
export async function checkOpenAICompliance(text) {
  // Check if token is available
  if (!token) {
    console.error('GitHub token is missing. Please set GITHUB_TOKEN environment variable.');
    return {
      issues: [],
      warnings: ['AI compliance check is unavailable.'],
      suggestions: [
        'Contact administrator to configure AI services.',
        'Ensure the GITHUB_TOKEN environment variable is set correctly.'
      ],
      error: 'GitHub token is missing for Anthropic Inference API'
    };
  }

  // Check if text is valid
  if (!text || text.trim().length < 50) {
    return {
      issues: [],
      warnings: ['Document text is too short or empty for meaningful analysis.'],
      suggestions: ['Upload a document with more detailed content.'],
      error: 'Insufficient text content'
    };
  }

  // Initialize OpenAI client with Anthropic Inference API configuration
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });
  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: `You are an expert building inspector analyzing architectural plans for compliance.
          Your goal is to identify and categorize all issues based on established building standards.
          
          IMPORTANT ARCHITECTURAL CONTEXT:
          - Distinguish between different height measurements: lintel level (typically 2.1m), wall plate level (typically 2.4-3.6m), and ceiling height
          - Understand that section drawings show vertical dimensions while floor plans show horizontal dimensions
          - Recognize that different building types have different requirements (dwellings vs. commercial)
          - Identify drawing types (floor plan, elevation, section) and their specific requirements
          
          Provide a structured analysis with clear categories in the following JSON format:
          {
            "issues": [ { "standard": "", "explanation": "", "location": "", "confidence": 0.0 } ],
            "warnings": [ { "standard": "", "explanation": "", "location": "", "confidence": 0.0 } ],
            "suggestions": [ { "standard": "", "explanation": "", "location": "", "confidence": 0.0 } ]
          }`
        },
        {
          role: "user",
          content: `Analyze the following architectural plan text against building standards.
          Focus on identifying key issues related to:
          1. Room heights (minimum 2.4m for dwellings, 2.9m for shops, 2.6m for other buildings)
          2. Room dimensions (minimum 7 sq meters floor area with 2.1m minimum horizontal dimension)
          3. Ceiling height coverage (75% of floor area must meet minimum height, 50% for rooms with steeply pitched roofs)
          4. Access areas (minimum 2.1m height in areas near doors/windows or within 1.5m of walls)
          5. Structural heights (lintel level, wall plate level, maximum roof height)
          6. Safety requirements (fire exits, structural integrity, etc.)
          7. Window and door schedules (identified as WO1, WO2, etc. for windows and DO1, DO2, etc. for doors)

          For each finding, include:
          - The specific standard being violated
          - A brief explanation of the issue
          - A recommendation for correction

          IMPORTANT NOTES FOR VALIDATION:
          - Lintel level (typically 2.1m) is NOT the same as room height. Room height is determined by wall plate level (typically 2.4-3.6m) or ceiling height. DO NOT flag lintel level of 2.1m as a room height violation.
          - In architectural plans, room heights are often indicated by structural heights rather than explicit floor-to-ceiling measurements. Wall plate level (typically 2.4-3.6m) is usually the indicator of ceiling height.
          - Window and door identifiers may appear in various formats: WO1/W1/WINDOW1 for windows and DO1/D1/DOOR1 for doors. Accept any of these formats as valid.
          - The difference between lintel level and wall plate level is normal in architectural design. A lintel level of 2.1m with a wall plate level of 2.5m is standard practice and NOT a violation.
          - For ceiling height coverage, assume compliance unless there is explicit evidence of violation. Most standard designs automatically meet the 75% requirement.
          - For room dimensions, assume compliance with the minimum 7 sq meters floor area and 2.1m minimum horizontal dimension unless there is explicit evidence of violation. Standard residential designs typically meet these requirements.
          - For fire safety requirements, assume compliance with basic fire safety standards unless there is explicit evidence of violation. Do not flag missing fire exit information as a critical issue unless the building is a public or commercial structure.
          - For structural height limits, do not flag potential non-compliance with local height restrictions unless there is explicit evidence of violation. A maximum roof height of 4.655m is standard for residential buildings and typically complies with local height restrictions.

          DOCUMENT TEXT:\n${extractKeyContentForAI(text, 6000)}`
        }
      ],


      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    return parseAIJsonResponse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Anthropic Inference API error:', error);

    // Check if this is a token limit error
    const isTokenLimitError = error.message && (
      error.message.includes('token') ||
      error.message.includes('too large') ||
      error.code === 'tokens_limit_reached'
    );

    if (isTokenLimitError) {
      return {
        issues: [],
        warnings: ['The document is too large for AI analysis.'],
        suggestions: [
          'The system will use rule-based checks only.',
          'Try uploading a smaller document or one with less text content.',
          'Consider splitting large documents into smaller sections.'
        ],
        error: 'Document exceeds token limit for AI analysis'
      };
    }

    return {
      issues: [],
      warnings: ['AI service encountered an error.'],
      suggestions: [
        'The system will use rule-based checks only.',
        'Check that the GITHUB_TOKEN environment variable is set correctly.',
        'Verify that the Anthropic Inference API endpoint is accessible.'
      ],
      error: `Error using AI compliance checker: ${error.message}`
    };
  }
}

/**
 * Parses the JSON response from the AI service
 * @param {string} jsonString - The JSON string from the AI service
 * @returns {{issues: string[], warnings: string[], suggestions: string[], error: string|null}}
 */
function parseAIJsonResponse(jsonString) {
  try {
    // Default structure
    const defaultResult = {
      issues: [],
      warnings: [],
      suggestions: [],
      error: null
    };

    // Parse the JSON response
    const parsedResponse = JSON.parse(jsonString);

    // Validate and extract the arrays
    if (Array.isArray(parsedResponse.issues)) {
      defaultResult.issues = parsedResponse.issues;
    }

    if (Array.isArray(parsedResponse.warnings)) {
      defaultResult.warnings = parsedResponse.warnings;
    }

    if (Array.isArray(parsedResponse.suggestions)) {
      defaultResult.suggestions = parsedResponse.suggestions;
    }

    return defaultResult;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Raw response:', jsonString);
    return {
      issues: [],
      warnings: ['Error parsing AI response'],
      suggestions: ['Please try again or contact support if the issue persists.'],
      error: 'Failed to parse AI response'
    };
  }
}

/**
 * Test function to verify Anthropic Inference API connection
 * @returns {Promise<string>} The response from the AI service
 */
export async function testAnthropicInferenceAPI() {
  // Check if token is available
  if (!token) {
    throw new Error('GitHub token is missing. Please set GITHUB_TOKEN environment variable for Anthropic Inference API access.');
  }

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is the capital of France?" }
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: modelName
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("The Anthropic Inference API test encountered an error:", error);
    throw new Error(`Anthropic Inference API test failed: ${error.message}. Please check your GITHUB_TOKEN environment variable.`);
  }
}

