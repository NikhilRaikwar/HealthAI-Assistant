import { ArrowRight, Activity, Shield, Brain, Users, MessageSquare, FileText, Scan, Camera } from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

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
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" />
      ),
    },
    {
      id: 'drugs',
      name: 'Drug Interactions',
      description: 'Check potential interactions between different medications.',
      icon: Shield,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20" />
      ),
    },
    {
      id: 'terms',
      name: 'Medical Terms',
      description: 'Understand complex medical terminology in simple language.',
      icon: Brain,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20" />
      ),
    },
    {
      id: 'medical-image',
      name: 'Medical Image Analyzer',
      description: 'Upload X-rays, CT scans, MRI, or ultrasound images for AI analysis.',
      icon: Scan,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" />
      ),
    },
    {
      id: 'medicine',
      name: 'Medicine Analyzer',
      description: 'Scan medicine packages to get detailed information and usage guidance.',
      icon: Camera,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" />
      ),
    },
    {
      id: 'reports',
      name: 'Report Summary',
      description: 'Upload medical reports for instant AI-powered summaries.',
      icon: FileText,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20" />
      ),
    },
    {
      id: 'policy',
      name: 'Policy Query Assistant',
      description: 'Upload policy documents and ask questions in natural language.',
      icon: Users,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20" />
      ),
    },
    {
      id: 'chat',
      name: 'Healthcare Chat',
      description: 'Chat with our AI assistant for instant health-related answers.',
      icon: MessageSquare,
      className: 'lg:col-span-1 lg:row-span-1',
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20" />
      ),
    },
  ];

  return (
    <div className="w-full animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:mx-auto lg:col-span-12 lg:text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                Your Personal
                <span className="block text-blue-600 dark:text-blue-400">Health Assistant</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl max-w-3xl mx-auto">
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
      <section className="bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why Choose HealthAI Assistant?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              Comprehensive health analysis tools powered by advanced AI technology
            </p>
          </div>

          <BentoGrid className="mt-12 auto-rows-[16rem] sm:auto-rows-[18rem] lg:auto-rows-[20rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {features.map((feature) => (
              <BentoCard
                key={feature.id}
                name={feature.name}
                className={feature.className}
                background={feature.background}
                Icon={feature.icon}
                description={feature.description}
                onClick={() => setActiveTab(feature.id)}
              />
            ))}
          </BentoGrid>
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