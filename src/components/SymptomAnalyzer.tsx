import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, Loader2, Mic, MicOff, Send, Sparkles, RefreshCw, X, AlertTriangle, Info } from 'lucide-react';
import { analyzeSymptoms } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

interface AnalysisMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 
  'Nausea', 'Dizziness', 'Sore throat', 'Body aches'
];

// Comprehensive symptom database for the autocomplete to work
const SYMPTOM_DATABASE = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Dizziness', 'Sore throat', 'Body aches',
  'Chest pain', 'Shortness of breath', 'Difficulty breathing', 'Wheezing', 'Rapid heartbeat',
  'Abdominal pain', 'Stomach pain', 'Cramping', 'Bloating', 'Constipation', 'Diarrhea',
  'Vomiting', 'Loss of appetite', 'Weight loss', 'Weight gain', 'Night sweats',
  'Chills', 'Sweating', 'Hot flashes', 'Cold hands or feet', 'Numbness', 'Tingling',
  'Joint pain', 'Muscle pain', 'Back pain', 'Neck pain', 'Shoulder pain', 'Knee pain',
  'Weakness', 'Fatigue', 'Lethargy', 'Drowsiness', 'Insomnia', 'Sleep disturbances',
  'Anxiety', 'Depression', 'Mood swings', 'Irritability', 'Confusion', 'Memory problems',
  'Blurred vision', 'Double vision', 'Eye pain', 'Sensitivity to light', 'Vision loss',
  'Ear pain', 'Hearing loss', 'Ringing in ears', 'Earache', 'Ear discharge',
  'Runny nose', 'Stuffy nose', 'Sneezing', 'Nasal congestion', 'Postnasal drip',
  'Dry mouth', 'Difficulty swallowing', 'Hoarseness', 'Voice changes', 'Swollen glands',
  'Skin rash', 'Itching', 'Hives', 'Red skin', 'Dry skin', 'Peeling skin', 'Blisters',
  'Bruising', 'Pale skin', 'Yellowing of skin', 'Jaundice', 'Swelling',
  'Hair loss', 'Brittle nails', 'Nail discoloration', 'Scalp itching',
  'Frequent urination', 'Painful urination', 'Blood in urine', 'Dark urine', 'Cloudy urine',
  'Irregular periods', 'Heavy periods', 'Missed periods', 'Painful periods', 'Vaginal discharge',
  'Erectile dysfunction', 'Testicular pain', 'Breast pain', 'Breast lump',
  'Difficulty concentrating', 'Forgetfulness', 'Mental fog', 'Disorientation',
  'Loss of balance', 'Coordination problems', 'Tremors', 'Seizures', 'Fainting',
  'Palpitations', 'Irregular heartbeat', 'Rapid pulse', 'Slow pulse',
  'High blood pressure', 'Low blood pressure', 'Lightheadedness',
  'Swollen feet', 'Swollen ankles', 'Swollen legs', 'Leg cramps',
  'Mouth sores', 'Bleeding gums', 'Toothache', 'Bad breath',
  'Excessive thirst', 'Increased hunger', 'Decreased appetite',
  'Sensitivity to cold', 'Sensitivity to heat', 'Temperature changes',
  'Burning sensation', 'Sharp pain', 'Dull ache', 'Throbbing pain',
  'Stiffness', 'Limited range of motion', 'Swollen joints',
  'Red eyes', 'Watery eyes', 'Dry eyes', 'Crusty eyelids',
  'Nosebleeds', 'Loss of smell', 'Loss of taste', 'Metallic taste',
  'Frequent headaches', 'Migraine', 'Tension headache', 'Cluster headache',
  'Panic attacks', 'Racing thoughts', 'Restlessness', 'Agitation',
  'Shortness of breath on exertion', 'Persistent cough', 'Coughing up blood',
  'Excessive sweating', 'Cold sweats', 'Clammy skin',
  'Heartburn', 'Acid reflux', 'Indigestion', 'Gas', 'Burping',
  'Difficulty breathing when lying down', 'Waking up short of breath',
  'Swollen lymph nodes', 'Tender lymph nodes', 'Lumps under skin',
  'Sunken eyes', 'Puffy eyes', 'Dark circles under eyes',
  'Muscle cramps', 'Muscle spasms', 'Muscle twitching',
  'Delayed wound healing', 'Easy bleeding', 'Easy bruising',
  'Frequent infections', 'Slow recovery from illness',
  'Changes in bowel habits', 'Blood in stool', 'Black stool', 'Pale stool',
  'Feeling of fullness', 'Early satiety', 'Difficulty eating',
  'Painful swallowing', 'Food getting stuck', 'Regurgitation',
  'Excessive gas', 'Flatulence', 'Belching',
  'Urinary incontinence', 'Urinary urgency', 'Weak urine stream',
  'Unable to empty bladder', 'Leaking urine',
  'Genital itching', 'Genital pain', 'Genital discharge', 'Genital sores',
  'Loss of consciousness', 'Blackouts', 'Near-fainting spells',
  'Jerking movements', 'Involuntary movements', 'Tics',
  'Sensitivity to noise', 'Sensitivity to touch', 'Heightened senses',
  'Hallucinations', 'Delusions', 'Paranoia',
  'Suicidal thoughts', 'Self-harm thoughts', 'Hopelessness',
  'Excessive worry', 'Panic', 'Fear', 'Phobias',
  'Social withdrawal', 'Loss of interest', 'Anhedonia',
  'Hyperactivity', 'Impulsivity', 'Attention problems',
  'Obsessive thoughts', 'Compulsive behaviors', 'Intrusive thoughts',
];

const EMERGENCY_KEYWORDS = [
  'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
  'stroke', 'heart attack', 'seizure', 'severe pain', 'can\'t breathe'
];

export default function SymptomAnalyzer() {
  const [input, setInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [messages, setMessages] = useState<AnalysisMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredSymptoms, setFilteredSymptoms] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 100);
    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Auto-focus textarea
  useEffect(() => {
    if (!messages.length || !loading) {
      textareaRef.current?.focus();
    }
  }, [loading, messages]);

  // Check for emergency keywords
  useEffect(() => {
    const inputLower = input.toLowerCase();
    const hasEmergency = EMERGENCY_KEYWORDS.some(keyword => inputLower.includes(keyword));
    setShowEmergencyBanner(hasEmergency);
  }, [input]);

  // Autocomplete filtering logic
  useEffect(() => {
    const lastWord = input.split(',').pop()?.trim() || '';
    
    if (lastWord.length >= 2) {
      const matches = SYMPTOM_DATABASE.filter(symptom =>
        symptom.toLowerCase().includes(lastWord.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      
      setFilteredSymptoms(matches);
      setShowAutocomplete(matches.length > 0);
    } else {
      setShowAutocomplete(false);
      setFilteredSymptoms([]);
    }
    setSelectedIndex(-1);
  }, [input]);

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const symptomsText = input.trim();
    if (!symptomsText) return;

    const userMessage: AnalysisMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: symptomsText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [symptomsText, ...prev.filter(s => s !== symptomsText)].slice(0, 3);
      return updated;
    });
    
    setInput('');
    setLoading(true);

    try {
      const result = await analyzeSymptoms(symptomsText);
      const aiMessage: AnalysisMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: AnalysisMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Error analyzing symptoms. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleClearInput = () => {
    setInput('');
    setInterimText('');
    textareaRef.current?.focus();
  };

  const handleQuickSymptom = (symptom: string) => {
    setInput(prev => prev ? `${prev}, ${symptom}` : symptom);
    textareaRef.current?.focus();
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setInterimText(interimTranscript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  const handleNewSession = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm('Start a new session? This will clear all messages.');
      if (confirmed) {
        setMessages([]);
        setInput('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAutocomplete && filteredSymptoms.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSymptoms.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectSymptom(filteredSymptoms[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey && selectedIndex === -1) {
      e.preventDefault();
      handleAnalyze(e as any);
    }
  };

  const handleSelectSymptom = (symptom: string) => {
    const words = input.split(',');
    words[words.length - 1] = ' ' + symptom;
    setInput(words.join(',') + ', ');
    setShowAutocomplete(false);
    setSelectedIndex(-1);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Header */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient-x"></div>
        <div className="relative px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center">
            {/* New Session Button - Absolute Right */}
            {messages.length > 0 && !loading && (
              <button
                onClick={handleNewSession}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                title="Start New Session"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            )}
            
            {/* Logo and Title - Centered */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-[1.5px] border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Symptom Analyzer
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {loading ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"></span>
                      <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-1 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="ml-1">Analyzing symptoms...</span>
                    </span>
                  ) : (
                    'AI-powered health analysis'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner - Fully Responsive */}
      {showEmergencyBanner && (
        <div className="bg-red-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-start sm:items-center gap-2 sm:gap-3 shadow-lg animate-slide-down">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs sm:text-sm">⚠️ Emergency Detected</p>
            <p className="text-[10px] sm:text-xs opacity-90 line-clamp-2 sm:line-clamp-none">If this is a medical emergency, call emergency services immediately (911 or local emergency number)</p>
          </div>
          <button onClick={() => setShowEmergencyBanner(false)} className="p-1 hover:bg-red-600 rounded transition-colors flex-shrink-0">
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Messages Container with Custom Scrollbar - Fully Responsive */}
      <div className={`flex-1 ${messages.length > 0 && "overflow-y-auto scrollbar-custom"} px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4 md:space-y-6 scroll-smooth`}>
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center px-2 sm:px-4">
            <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 max-w-xs sm:max-w-md md:max-w-2xl animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-float">
                <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">
                  Welcome to Symptom Analyzer
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 px-2">
                  Describe your symptoms and get AI-powered health analysis
                </p>
              </div>
              
              {/* Recent Searches - Responsive */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Searches</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(search)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 border border-blue-200 dark:border-blue-800 max-w-[150px] sm:max-w-none truncate"
                      >
                        {search.length > 25 ? search.substring(0, 25) + '...' : search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 sm:gap-3 animate-slide-up ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            )}

            <div
              className={`group relative max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[70%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50'
              } rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-3 transition-all duration-300 hover:scale-[1.02]`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-xs sm:prose-sm md:prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">U</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area - Fully Responsive */}
      <div className="sticky bottom-16 sm:bottom-20 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-2 sm:p-3 md:p-4 lg:p-5 shadow-2xl">
        <form onSubmit={handleAnalyze} className="max-w-6xl mx-auto space-y-2 sm:space-y-3">
          
          {/* Quick Symptom Chips - Responsive */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {COMMON_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => handleQuickSymptom(symptom)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:scale-105 hover:shadow-md transition-all duration-200"
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Main Input Container - Responsive */}
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-1.5 sm:p-2 border-2 border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:shadow-blue-500/20 transition-all duration-300">
            
            {/* Autocomplete Dropdown */}
            {showAutocomplete && filteredSymptoms.length > 0 && (
              <div
                ref={autocompleteRef}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-200 dark:border-blue-700 max-h-64 overflow-y-auto z-50 animate-fade-in"
              >
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Suggested Symptoms
                  </p>
                </div>
                {filteredSymptoms.map((symptom, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSymptom(symptom)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                      index === selectedIndex
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'
                    } ${index === filteredSymptoms.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'}`}
                  >
                    <span className="font-medium">{symptom}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Voice Input Button with Pulse Animation - Responsive */}
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={loading}
              className={`flex-shrink-0 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></span>
                </div>
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Textarea - Responsive */}
            <textarea
              ref={textareaRef}
              value={input + interimText}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent border-none outline-none px-2 py-2 sm:px-3 sm:py-2.5 md:py-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 max-h-24 sm:max-h-32 disabled:opacity-50 font-medium"
              style={{ minHeight: '40px' }}
            />

            {/* Clear Button - Responsive */}
            {input && !loading && (
              <button
                type="button"
                onClick={handleClearInput}
                className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                title="Clear input"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            
            {/* Submit Button - Prominent & Responsive */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white text-sm sm:text-base font-semibold shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Analyzing</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Analyze</span>
                </div>
              )}
            </button>
          </div>
          
          {/* Disclaimer with Info Tooltip - Responsive */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-center px-2">
            <div className="relative group">
              <button
                type="button"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              {showInfoTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-64 p-2 sm:p-3 bg-gray-900 dark:bg-gray-700 text-white text-[10px] sm:text-xs rounded-lg shadow-xl z-50 animate-fade-in">
                  <p className="font-semibold mb-1">Important Disclaimer</p>
                  <p>This AI analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              ⚕️ AI-powered analysis • Always consult healthcare professionals
            </p>
          </div>
        </form>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(59, 130, 246), rgb(99, 102, 241));
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(37, 99, 235), rgb(79, 70, 229));
        }
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
