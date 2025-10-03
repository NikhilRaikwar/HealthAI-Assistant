import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileText, Upload, MessageSquare, Send, Loader, Bot, User, AlertCircle, RefreshCw } from 'lucide-react';
import { extractTextFromPdf } from '../utils/pdfUtils';
import { queryMedicalReport, validateMedicalReport } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { PageContainer } from './ui/PageContainer';
import { ChatMessage } from '../types';

export default function ReportSummarizer() {
  const [reportText, setReportText] = useState('');
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearSession = () => {
    setReportText('');
    setFileName('');
    setMessages([]);
    setInput('');
    setError('');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadLoading(true);
    setFileName(file.name);
    setError('');
    setMessages([]);
    
    try {
      const text = await extractTextFromPdf(file);
      
      // Validate if the extracted text is actually a medical report
      const isValidMedicalReport = await validateMedicalReport(text);
      
      if (!isValidMedicalReport) {
        setError('⚠️ This doesn\'t appear to be a medical report. Please upload a valid medical document.');
        setReportText('');
        setFileName('');
        return;
      }
      
      setReportText(text);
      setMessages([{
        type: 'bot',
        content: `✅ **Medical report "${file.name}" has been successfully uploaded and processed!**\n\nYou can now ask me anything about your medical report. For example:\n- "What are my blood test results?"\n- "Explain the diagnosis in simple terms"\n- "Are there any abnormal findings?"\n- "What do the test values mean?"\n- "What should I discuss with my doctor?"`,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error(error);
      setError('Error processing the medical report. Please try again.');
      setReportText('');
      setFileName('');
    } finally {
      setUploadLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !reportText) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    // Add typing indicator
    const typingMessage: ChatMessage = {
      type: 'bot',
      content: '...',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await queryMedicalReport(userMessage.content, reportText);
      
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          type: 'bot',
          content: response,
          timestamp: new Date(),
        }];
      });
    } catch (error) {
      console.error(error);
      setError('Failed to process your query. Please try again.');
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          type: 'bot',
          content: 'I apologize, but I encountered an error processing your query. Please try again.',
          timestamp: new Date(),
        }];
      });
    }

    setLoading(false);
  };

  const renderChatInterface = () => (
    <div className="mt-6 flex flex-col h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && reportText && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium">Medical Report Assistant Ready!</p>
            <p className="mt-2">Ask me anything about your uploaded medical report.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {message.isTyping ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-gray-500 dark:text-gray-400">Analyzing report...</span>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="flex gap-3 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your medical report (e.g., 'What are my blood test results?')"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
          disabled={loading || !reportText}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !reportText}
          className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Processing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Ask</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  return (
    <PageContainer
      icon={<FileText className="w-6 h-6 text-blue-600" />}
      title="Medical Report Assistant"
    >
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="relative">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            } ${reportText ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-500/30' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 ${reportText ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            {uploadLoading ? (
              <div className="mt-4">
                <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Processing medical report...</p>
              </div>
            ) : reportText ? (
              <div className="mt-4">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">✅ Medical report uploaded successfully!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to upload a different report</p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Drag and drop your medical report PDF here, or click to select
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supports PDF files up to 50MB
                </p>
              </div>
            )}
          </div>
          
          {/* Clear Session Button */}
          {reportText && (
            <button
              onClick={handleClearSession}
              className="absolute top-4 right-4 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              New Session
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">How to Use Medical Report Assistant</h3>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <p><strong>1. Upload:</strong> Upload your medical report (PDF format)</p>
            <p><strong>2. Chat:</strong> Ask questions in natural language about your report</p>
            <p><strong>3. Get Answers:</strong> Receive detailed, easy-to-understand explanations</p>
            <p><strong>4. New Session:</strong> Click "New Session" to clear and start fresh</p>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Sample Questions:</h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• "What are my blood test results?"</li>
              <li>• "Explain the diagnosis in simple terms"</li>
              <li>• "Are there any abnormal findings?"</li>
              <li>• "What do my cholesterol levels mean?"</li>
              <li>• "What should I discuss with my doctor?"</li>
            </ul>
          </div>
        </div>

        {/* Chat Interface */}
        {reportText && renderChatInterface()}
      </div>
    </PageContainer>
  );
}