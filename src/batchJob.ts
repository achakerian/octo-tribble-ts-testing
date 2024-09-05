import fs from 'fs';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OpenAIEndpoint = "/v1/chat/completions";
type CompletionWindow = "24h" ; 

// Function to process the batch job
async function processBatch(inputFilePath: string, endpoint: OpenAIEndpoint, completionWindow: CompletionWindow): Promise<any> {
  try {
    // Upload the input file
    const fileStream = fs.createReadStream(inputFilePath);
    const uploadedFile = await client.files.create({
      purpose: 'batch',
      file: fileStream,
    });

    console.log(`Uploaded input file: ${uploadedFile.id}`);

    // Create the batch job
    let batchJob = await client.batches.create({
      input_file_id: uploadedFile.id,
      endpoint: endpoint,
      completion_window: completionWindow,
    });

    console.log(`Batch job created with ID: ${batchJob.id}`);

    // Monitor the batch job status
    let jobStatus = batchJob.status;
    while (jobStatus !== 'completed' && jobStatus !== 'failed' && jobStatus !== 'cancelled') {
      batchJob = await client.batches.retrieve(batchJob.id);
      jobStatus = batchJob.status;
      console.log(jobStatus);
    }
    

    // Handle the results
    if (jobStatus === 'completed') {
      const resultFileId = batchJob.output_file_id;

      if (resultFileId) {
        // Retrieve file content using OpenAI's `files.content` method
        const fileResponse = await client.files.content(resultFileId);
        const fileContents = await fileResponse.text(); // Get the content as text

        const resultFileName = 'batch_job_results.jsonl';

        // Save results to a file
        fs.writeFileSync(resultFileName, fileContents);

        console.log(`Results saved to ${resultFileName}`);

        return resultFileName;
      } else {
        console.error('Batch job completed, but no result file ID was returned.');
        return null;
      }
    } else {
      console.log(`Batch job failed with status: ${jobStatus}`);
      return null;
    }
  } catch (error) {
    console.error('Error during batch processing:', error);
    return null;
  }
}

// Main execution
(async () => {
  const inputFilePath = path.join('./input.jsonl');  // .jsonl file path
  const endpoint: OpenAIEndpoint = '/v1/chat/completions'; 
  const completionWindow: CompletionWindow = '24h';

  const resultFileName = await processBatch(inputFilePath, endpoint, completionWindow);

  // Print the results
  if (resultFileName) {
    console.log(`Batch processing completed. Results saved in ${resultFileName}`);
  }
})();
