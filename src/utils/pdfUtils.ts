import { pdfjs } from 'react-pdf';

// Set worker URL for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument(typedarray).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        resolve(fullText.trim());
      } catch (error) {
        reject(new Error('Failed to extract text from PDF'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}