import React, { useState } from 'react';
import { Pill, Plus, X, Loader, AlertCircle } from 'lucide-react';
import { checkDrugInteraction } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function DrugInteraction() {
  const [drugs, setDrugs] = useState<string[]>([]);
  const [currentDrug, setCurrentDrug] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addDrug = () => {
    if (currentDrug.trim() && !drugs.includes(currentDrug.trim())) {
      setDrugs([...drugs, currentDrug.trim()]);
      setCurrentDrug('');
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDrug();
    }
  };

  const removeDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
    setError('');
  };

  const handleCheck = async () => {
    if (drugs.length < 2) {
      setError('Please enter at least two medications to check for interactions.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await checkDrugInteraction(drugs);
      setAnalysis(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error checking drug interactions. Please try again.');
      setAnalysis('');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Pill className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 text-center">Drug Interaction Checker</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={currentDrug}
          onChange={(e) => setCurrentDrug(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter medication name and press Enter"
        />
        <button
          onClick={addDrug}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 min-h-[50px]">
        {drugs.map((drug, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full group hover:bg-gray-200 transition-colors duration-200"
          >
            <span className="text-gray-700">{drug}</span>
            <button
              onClick={() => removeDrug(index)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleCheck}
        disabled={loading || drugs.length < 2}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Checking Interactions...
          </>
        ) : (
          'Check Interactions'
        )}
      </button>

      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Interaction Analysis:</h3>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}