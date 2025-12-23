import { info } from "console";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import { inflate } from "zlib";


export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.parse();
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    } catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }

};