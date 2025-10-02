import React, { useState, useEffect } from 'react';
import { Stethoscope, Loader, AlertTriangle, Clock, User, History, Download, Mic, MicOff, Heart, Brain, Activity, Bone } from 'lucide-react';
import { analyzeSymptoms } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

interface SymptomAnalysis {
  id: string;
  symptoms: string;
  analysis: string;
  timestamp: Date;
  severity: string;
  duration: string;
}

export default function SymptomAnalyzer() {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('1-2 days');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [analysisHistory, setAnalysisHistory] = useState<SymptomAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const suggestedSymptoms = {
    general: [
      "Headache and fever for 2 days",
      "Fatigue and muscle aches",
      "Dizziness and lightheadedness",
      "Sleep problems and anxiety"
    ],
    respiratory: [
      "Persistent cough with chest pain",
      "Shortness of breath during exercise",
      "Sore throat and runny nose",
      "Wheezing and difficulty breathing"
    ],
    digestive: [
      "Nausea and stomach pain after eating",
      "Diarrhea and cramping",
      "Loss of appetite and weight loss"
    ],
    musculoskeletal: [
      "Joint pain and stiffness in the morning",
      "Back pain radiating to legs",
      "Neck pain and headaches",
      "Muscle weakness and soreness"
    ],
    neurological: [
      "Memory problems and confusion",
      "Numbness and tingling in hands",
      "Vision changes and eye pain",
      "Coordination problems"
    ],
    skin: [
      "Skin rash with itching",
      "Unusual moles or spots",
      "Dry skin and eczema",
      "Hair loss and scalp issues"
    ]
  };

  const emergencySymptoms = [
    "chest pain", "difficulty breathing", "severe headache", "loss of consciousness",
    "severe bleeding", "poisoning", "severe burns", "stroke symptoms"
  ];

  const categories = [
    { id: 'general', name: 'General', icon: User },
    { id: 'respiratory', name: 'Respiratory', icon: Heart },
    { id: 'digestive', name: 'Digestive', icon: Activity },
    { id: 'musculoskeletal', name: 'Bones & Joints', icon: Bone },
    { id: 'neurological', name: 'Neurological', icon: Brain },
    { id: 'skin', name: 'Skin', icon: User }
  ];

  // Load analysis history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('symptom-analysis-history');
    if (saved) {
      setAnalysisHistory(JSON.parse(saved));
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    // Check for emergency symptoms
    const hasEmergency = emergencySymptoms.some(emergency => 
      symptoms.toLowerCase().includes(emergency)
    );
    
    setLoading(true);
    try {
      const context = `
        Symptoms: ${symptoms}
        Severity: ${severity}
        Duration: ${duration}
        Age: ${age || 'Not specified'}
        Gender: ${gender || 'Not specified'}
        ${hasEmergency ? 'URGENT: This may require immediate medical attention.' : ''}
      `;
      
      const result = await analyzeSymptoms(context);
      setAnalysis(result);
      
      // Save to history
      const newAnalysis: SymptomAnalysis = {
        id: Date.now().toString(),
        symptoms,
        analysis: result,
        timestamp: new Date(),
        severity,
        duration
      };
      
      const updatedHistory = [newAnalysis, ...analysisHistory].slice(0, 10); // Keep last 10
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('symptom-analysis-history', JSON.stringify(updatedHistory));
      
    } catch (error) {
      console.error(error);
      setAnalysis('Error analyzing symptoms. Please try again.');
    }
    setLoading(false);
  };

  const handleSuggestedSymptom = (symptom: string) => {
    setSymptoms(symptom);
    setAnalysis(''); // Clear previous analysis
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(transcript);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    const content = `
Symptom Analysis Report
Generated: ${new Date().toLocaleString()}

Symptoms: ${symptoms}
Severity: ${severity}
Duration: ${duration}
Age: ${age || 'Not specified'}
Gender: ${gender || 'Not specified'}

Analysis:
${analysis}

Disclaimer: This analysis is for informational purposes only and should not replace professional medical advice.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symptom-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const checkForEmergency = (text: string) => {
    return emergencySymptoms.some(emergency => 
      text.toLowerCase().includes(emergency)
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header with History Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Symptom Analyzer</h2>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          History ({analysisHistory.length})
        </button>
      </div>

      {/* Emergency Warning */}
      {symptoms && checkForEmergency(symptoms) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Emergency Warning</span>
          </div>
          <p className="text-red-600 dark:text-red-300 mt-1">
            Your symptoms may require immediate medical attention. Consider contacting emergency services or visiting an emergency room.
          </p>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Analysis History</h3>
          {analysisHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No previous analyses found.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {analysisHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-gray-800 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSymptoms(item.symptoms);
                    setAnalysis(item.analysis);
                    setShowHistory(false);
                  }}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.timestamp.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.symptoms}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Symptom Categories:</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Suggested Symptoms for Selected Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedSymptoms[selectedCategory as keyof typeof suggestedSymptoms]?.map((symptom, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedSymptom(symptom)}
              className="p-2 text-sm text-left bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Context Form */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <User className="w-5 h-5" />
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity Level
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="very-severe">Very Severe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="less-than-1-day">Less than 1 day</option>
              <option value="1-2 days">1-2 days</option>
              <option value="3-7 days">3-7 days</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="more-than-2-weeks">More than 2 weeks</option>
              <option value="chronic">Chronic (months/years)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Optional"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select (Optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Describe your symptoms in detail:
            </label>
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isListening}
              className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3 h-3" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" />
                  Voice Input
                </>
              )}
            </button>
          </div>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 dark:bg-slate-500 dark:text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your symptoms in detail... e.g., 'I have been experiencing a headache for 2 days, along with mild fever and fatigue.'"
            maxLength={1000}
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Analysis Results:</h3>
            <button
              onClick={downloadAnalysis}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown className="dark:text-gray-50">{analysis}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Medical Disclaimer</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              This tool provides general health information and should not be used as a substitute for professional medical advice, 
              diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns. 
              In case of emergency, contact your local emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}