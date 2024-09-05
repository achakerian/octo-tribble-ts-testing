import fs from "fs";
import pdfParse from "pdf-parse"

// read PDF from file and return txt
async function pdfToText(pdfPath: string): Promise<string> {
  try {
    // Read the PDF file as a buffer
    const dataBuffer = fs.readFileSync(pdfPath);

    // Parse the PDF to extract text
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error("An error occurred:", error);
    return "";
  }
}

const debug = false;
if (debug) {
  // Example usage
  const inputPdfPath = "./PDFs/example.pdf"; // Replace with your PDF file path
  pdfToText(inputPdfPath);
}

export { pdfToText }