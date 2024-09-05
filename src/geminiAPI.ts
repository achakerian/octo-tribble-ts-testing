import {
    GoogleGenerativeAI,
    GenerativeModel,
    GenerateContentResult,
  } from "@google/generative-ai";
  import readline from "readline";
  import fs from "fs";
  import { pdfToText } from "./extractPDF";
  const apiKey: string | undefined = process.env.GeminiAPI_KEY;
  
  if (!apiKey) {
    console.error("API key is not set in environment variables.");
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  // readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  // generate a timestamped filename
  function generateFilename(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}_conversation.txt`;
  }
  
  //save to file
  const conversationFilePath: string = "./AIconversations/" + generateFilename();
  function appendToFile(text: string): void {
    fs.appendFile(conversationFilePath, text + "\n", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      }
    });
  }
  
  // Gemini response structured format
  async function generateQuestionResponse(prompt: string): Promise<string> {
    try {
      // generate explicitly for a structured output
      // const input = await pdfToText("./PDFs/example.pdf"); if you want to test the pdfExtracter
      const instruction: string = `Respond with a five questions in this format: "Question: [your question here]?" based on "${prompt}"`;
      const result: GenerateContentResult = await model.generateContent(
        instruction
      );
      const aiResponse: string = result.response.text().trim(); // Assuming `response` has a `.text()` method
  
      // validate the response structure - not sure how to do this better
      if (!aiResponse.startsWith("Question: ") || !aiResponse.endsWith("?")) {
        console.error(
          "Error: The response is not formatted as a valid question.",
          aiResponse
        );
        return "Sorry, I didn’t generate a valid question. Please try again.";
      }
      // append to conversation file
      appendToFile(`AI: ${aiResponse}`);
      return aiResponse;
    } catch (error) {
      console.error("Error generating content:", error);
      return "An error occurred. Please try again.";
    }
  }
  
  // user input and generate AI responses
  function handlePrompt(): void {
    rl.question("Enter your prompt: ", async (userInput: string) => {
      // Exit if the user types 'exit'
      if (userInput.toLowerCase() === "exit") {
        console.log("Exiting the conversation.");
        rl.close();
        return;
      }
  
      // Append user input to file
      appendToFile(`User: ${userInput}`);
  
      const aiResponse: string = await generateQuestionResponse(userInput);
  
      console.log(`AI: ${aiResponse}`);
  
      // continue prompting user input
      handlePrompt();
    });
  }
  
  // Start the prompt loop
  handlePrompt();