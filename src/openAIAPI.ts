import * as dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

// question structure
export const Question = z.object({
  question_text: z.string(),
});

// idk copied off Deb
export const Category = z.object({
  category_name: z.string(),
  questions: z.array(Question),
});

// zod API response: array of categories
export const QuestionResponse = z.object({
  categories: z.array(Category),
});

// env API key
export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// function to prompt OpenAI and parse the response using Zod
async function promptSubUUID(prompt: string, submission: string, uuid: string): Promise<[string, string]> {
  try {
   // console.log("[x] Sending to OpenAI: \n prompt:", prompt + "\nsubmission:\n" + submission)
    const response = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06", // Use the appropriate model
      messages: [{ role: "user", content: prompt + "\n\n" + submission }],
      response_format: zodResponseFormat(QuestionResponse, "QuestionResponse"),
    });

    const responseText = response.choices[0].message.content;
    if (responseText != null) return [responseText, uuid];
    else return ["response error", uuid];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export { promptSubUUID };

// ------------------- debugging --------------------//

const debug = false;
if (debug) {
  (async () => {
    try {
      const response = await promptSubUUID(
        // student submission , prompt used, UUID
       "photosynthesis", "please provide three questions to assess my understanding of the text submission", "1324"
      );
      if (response) console.log("The response is: ", response);
    } catch (error) {
      console.error("failed to get response", error);
    }
  })();
}

