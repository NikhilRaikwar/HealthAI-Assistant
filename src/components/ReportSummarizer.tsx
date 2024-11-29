import React, { useState, useCallback } from 'react';
import { FileText, Loader, Upload } from 'lucide-react';
import { summarizeMedicalReport } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { extractTextFromPdf } from '../utils/pdfUtils';
import { PageContainer } from './ui/PageContainer';

export default function ReportSummarizer() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    
    try {
      const text = await extractTextFromPdf(file);
      const result = await summarizeMedicalReport(text);
      setSummary(result);
    } catch (error) {
      console.error(error);
      setSummary('Error processing the report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  return (
    <PageContainer
      icon={<FileText className="w-6 h-6 text-blue-600" />}
      title="Medical Report Summarizer"
    >
      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your medical report PDF here, or click to select
          </p>
          {fileName && (
            <p className="mt-2 text-sm text-blue-600 font-medium">{fileName}</p>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Analyzing report...</span>
          </div>
        )}

        {summary && (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary:</h3>
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}