import React, { useState } from 'react';
import { BookOpen, Loader, AlertCircle } from 'lucide-react';
import { explainMedicalTerm } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function MedicalTermExplainer() {
  const [term, setTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      setError('Please enter a medical term to explain.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const result = await explainMedicalTerm(term);
      setExplanation(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error explaining term. Please try again.');
      setExplanation('');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 text-center">Medical Term Explainer</h2>
      </div>

      <form onSubmit={handleExplain} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setError('');
            }}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            placeholder="Enter a medical term..."
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm('');
                setError('');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !term.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Explaining...
            </>
          ) : (
            'Explain Term'
          )}
        </button>
      </form>

      {explanation && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Explanation:</h3>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Pro Tip:</h4>
        <p className="text-sm text-blue-600">
          You can enter medical terms in multiple languages. The explanation will be provided in the same language as your input.
        </p>
      </div>
    </div>
  );
}