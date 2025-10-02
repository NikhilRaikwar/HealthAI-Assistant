import React, { useState } from 'react';
import { Stethoscope, Loader } from 'lucide-react';
import { analyzeSymptoms } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function SymptomAnalyzer() {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    setLoading(true);
    try {
      const result = await analyzeSymptoms(symptoms);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis('Error analyzing symptoms. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Stethoscope className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">Symptom Analyzer</h2>
      </div>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="relative">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 dark:bg-slate-500 dark:text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your symptoms in detail..."
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-900">
            {symptoms.length}/1000
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !symptoms.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Symptoms'
          )}
        </button>
      </form>

      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Analysis Results:</h3>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown className="dark:text-gray-50">{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}