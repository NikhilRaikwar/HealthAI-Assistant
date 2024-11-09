import React from 'react';
import { Github, Globe, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">About HealthAI Assistant</h2>
        
        <div className="space-y-6">
          <section className="prose prose-blue max-w-none">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">About the Project</h3>
            <p className="text-gray-600">
              HealthAI Assistant is an innovative healthcare analysis tool that leverages the power of Google's Gemini AI to provide intelligent health-related insights. The project aims to make medical information more accessible and understandable for everyone through features like symptom analysis, drug interaction checking, medical term explanation, and report summarization.
            </p>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">About the Developer</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src="https://i.imgur.com/N438dFe.png"
                  alt="Nikhil Raikwar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-800">Nikhil Raikwar</h4>
                  <p className="text-gray-600 mt-2">
                    Full Stack Developer passionate about creating innovative solutions in healthcare technology. Specialized in building user-friendly applications that make a difference in people's lives.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <a
                      href="https://nikhilraikwar.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Portfolio</span>
                    </a>
                    <a
                      href="https://github.com/nikhilraikwar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href="mailto:raikwarnikhil80@gmail.com"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Technologies Used</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>React with TypeScript for the frontend</li>
              <li>Tailwind CSS for styling</li>
              <li>Google's Gemini AI API for intelligent analysis</li>
              <li>Lucide React for beautiful icons</li>
              <li>React Markdown for formatted text rendering</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}