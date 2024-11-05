import React, { useState } from 'react';
import { Pill, Plus, X, Loader } from 'lucide-react';
import { checkDrugInteraction } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function DrugInteraction() {
  const [drugs, setDrugs] = useState<string[]>([]);
  const [currentDrug, setCurrentDrug] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const addDrug = () => {
    if (currentDrug && !drugs.includes(currentDrug)) {
      setDrugs([...drugs, currentDrug]);
      setCurrentDrug('');
    }
  };

  const removeDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  const handleCheck = async () => {
    if (drugs.length < 2) return;
    setLoading(true);
    try {
      const result = await checkDrugInteraction(drugs);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis('Error checking drug interactions. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Pill className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Drug Interaction Checker</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={currentDrug}
          onChange={(e) => setCurrentDrug(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter medication name"
        />
        <button
          onClick={addDrug}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {drugs.map((drug, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
          >
            <span>{drug}</span>
            <button
              onClick={() => removeDrug(index)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleCheck}
        disabled={loading || drugs.length < 2}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Interaction Analysis:</h3>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}