import * as dotenv from 'dotenv';
import { Question, Category, QuestionResponse, promptSubUUID } from '../src/openAIAPI';

// Load environment variables for testing
dotenv.config();

// Mock the OpenAI client
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Mocked response" } }],
        }),
      },
    },
  })),
}));

describe('Environment Setup', () => {
  test('should load environment variables', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });
});

describe('Zod Schema Validation', () => {
  test('should validate Question schema', () => {
    const validQuestion = { question_text: 'What is the capital of France?' };
    expect(() => Question.parse(validQuestion)).not.toThrow();

    const invalidQuestion = { question_text: 123 }; // Invalid: question_text should be a string
    expect(() => Question.parse(invalidQuestion)).toThrow();
  });

  test('should validate Category schema', () => {
    const validCategory = {
      category_name: 'Geography',
      questions: [{ question_text: 'What is the capital of France?' }],
    };
    expect(() => Category.parse(validCategory)).not.toThrow();

    const invalidCategory = {
      category_name: 'Geography',
      questions: [{ question_text: 123 }], // Invalid: question_text should be a string
    };
    expect(() => Category.parse(invalidCategory)).toThrow();
  });

  test('should validate QuestionResponse schema', () => {
    const validResponse = {
      categories: [
        {
          category_name: 'Geography',
          questions: [{ question_text: 'What is the capital of France?' }],
        },
      ],
    };
    expect(() => QuestionResponse.parse(validResponse)).not.toThrow();

    const invalidResponse = {
      categories: [
        {
          category_name: 'Geography',
          questions: [{ question_text: 123 }], // Invalid: question_text should be a string
        },
      ],
    };
    expect(() => QuestionResponse.parse(invalidResponse)).toThrow();
  });
});

describe('Function promptSubUUID', () => {
  test('should return expected output', async () => {
    const prompt = 'What is the capital of France?';
    const submission = 'I think it is Paris.';
    const uuid = '1234-5678';

    const [responseText, responseUuid] = await promptSubUUID(prompt, submission, uuid);

    expect(responseText).toBe('Mocked response');
    expect(responseUuid).toBe(uuid);
  });
});

