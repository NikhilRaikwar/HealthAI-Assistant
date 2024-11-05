import React, { useState } from 'react';
import { BookOpen, Loader } from 'lucide-react';
import { explainMedicalTerm } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function MedicalTermExplainer() {
  const [term, setTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await explainMedicalTerm(term);
      setExplanation(result);
    } catch (error) {
      console.error(error);
      setExplanation('Error explaining term. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Medical Term Explainer</h2>
      </div>

      <form onSubmit={handleExplain} className="space-y-4">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a medical term..."
        />

        <button
          type="submit"
          disabled={loading || !term}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Explanation:</h3>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}