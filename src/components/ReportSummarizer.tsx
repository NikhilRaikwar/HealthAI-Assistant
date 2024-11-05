import React, { useState } from 'react';
import { FileText, Loader } from 'lucide-react';
import { summarizeMedicalReport } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function ReportSummarizer() {
  const [report, setReport] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await summarizeMedicalReport(report);
      setSummary(result);
    } catch (error) {
      console.error(error);
      setSummary('Error summarizing report. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Medical Report Summarizer</h2>
      </div>

      <form onSubmit={handleSummarize} className="space-y-4">
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Paste your medical report here..."
        />

        <button
          type="submit"
          disabled={loading || !report}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Summarizing...
            </>
          ) : (
            'Summarize Report'
          )}
        </button>
      </form>

      {summary && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Summary:</h3>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}