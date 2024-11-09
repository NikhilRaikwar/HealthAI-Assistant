import React from 'react';
import { ArrowRight, Activity, Shield, Brain, Users } from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';

export default function Homepage() {
  const { setActiveTab } = useNavigationContext();

  const handleGetStarted = () => {
    setActiveTab('symptoms');
  };

  const features = [
    {
      id: 'symptoms',
      name: 'Symptom Analysis',
      description: 'Get instant analysis of your symptoms with AI-powered insights.',
      icon: Activity,
    },
    {
      id: 'drugs',
      name: 'Drug Interactions',
      description: 'Check potential interactions between different medications.',
      icon: Shield,
    },
    {
      id: 'terms',
      name: 'Medical Terms',
      description: 'Understand complex medical terminology in simple language.',
      icon: Brain,
    },
    {
      id: 'reports',
      name: 'Report Summary',
      description: 'Convert complex medical reports into easy-to-understand summaries.',
      icon: Users,
    },
  ];

  return (
    <div className="w-full animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:mx-auto lg:col-span-12 lg:text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Your Personal
                <span className="block text-blue-600">Health Assistant</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl max-w-3xl mx-auto">
                Powered by advanced AI technology to help you understand your health better. Get instant analysis of symptoms, drug interactions, and medical terms.
              </p>
              <div className="mt-8 sm:mt-12">
                <button 
                  onClick={handleGetStarted}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose HealthAI Assistant?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
              Comprehensive health analysis tools powered by advanced AI technology
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50 text-left group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white group-hover:bg-blue-600 transition-colors">
                  {<feature.icon className="h-6 w-6" />}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-blue-600">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <ArrowRight className="h-5 w-5 text-blue-500" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to take control of your health?
              <span className="block text-blue-200">Start using HealthAI Assistant today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 lg:justify-end">
              <div className="inline-flex rounded-lg shadow">
                <button 
                  onClick={handleGetStarted}
                  className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}