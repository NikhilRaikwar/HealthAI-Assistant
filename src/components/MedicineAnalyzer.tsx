import React, { useState } from 'react';
import { Pill, Upload, Send, AlertTriangle, Loader, Clock, Heart, Shield, Utensils, RefreshCw } from 'lucide-react';
import { analyzeMedicine, validateMedicineImage } from '../lib/gemini';

interface MedicineAnalysis {
  medicineName: string;
  activeIngredients: string[];
  whatItHelps: string[];
  severity: 'Low' | 'Medium' | 'High';
  doctorConsultationRequired: boolean;
  whenToTake: {
    timing: string[];
    withFood: 'Before' | 'After' | 'With' | "Doesn't matter";
    frequency: string;
  };
  sideEffects: {
    common: string[];
    serious: string[];
    patientSpecific: string[];
  };
  precautions: string[];
  interactions: string[];
  confidence: number;
}

export default function MedicineAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [analysis, setAnalysis] = useState<MedicineAnalysis | null>(null);
  const [error, setError] = useState('');
  const [validationWarning, setValidationWarning] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImage(file);
        const reader = new FileReader();
        reader.onload = (evt) => {
          setImagePreview(evt.target?.result as string);
        };
        reader.readAsDataURL(file);
        setError('');
        setValidationWarning('');
        setAnalysis(null);
        
        // Validate the uploaded image
        validateUploadedImage(file);
      } else {
        setError('Please upload a valid image file');
      }
    }
  };

  const validateUploadedImage = async (file: File) => {
    setValidating(true);
    try {
      const base64Image = await convertImageToBase64(file);
      const validation = await validateMedicineImage(base64Image);
      
      if (!validation.isValid) {
        setValidationWarning(validation.message);
      } else {
        setValidationWarning('');
      }
    } catch (err) {
      console.error('Validation error:', err);
      // Continue even if validation fails
    } finally {
      setValidating(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image of the medicine');
      return;
    }

    // If there's a validation warning, prevent analysis
    if (validationWarning) {
      setError('Cannot analyze non-medicine images. Please upload a valid medicine image (tablets, capsules, bottles, packaging, etc.).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const base64Image = await convertImageToBase64(image);
      
      // Final validation before analysis
      const validation = await validateMedicineImage(base64Image);
      if (!validation.isValid) {
        setError(validation.message + '\n\nPlease upload a clear image of medicine packaging, tablets, capsules, or medicine bottles.');
        setLoading(false);
        return;
      }
      
      const result = await analyzeMedicine(base64Image, additionalInfo.trim());
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      High: 'bg-red-500 text-white',
      Medium: 'bg-yellow-500 text-gray-900',
      Low: 'bg-green-500 text-white'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Pill className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">
          Medicine Analyzer
        </h2>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Medicine preview"
                className="max-h-64 mx-auto rounded-xl border-2 border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  setValidationWarning('');
                }}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Medicine Image
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Take a clear photo of the medicine package - PNG, JPG up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="medicine-image-upload"
                />
                <label htmlFor="medicine-image-upload">
                  <span className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Choose Image
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Information (Optional)
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter any specific questions about this medicine, your medical conditions, or concerns..."
          />
        </div>

        {validationWarning && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">⚠️ Not a Medicine Image</h4>
                <p className="text-sm text-orange-700 dark:text-orange-400 mb-2">{validationWarning}</p>
                <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
                  💊 Please upload valid medicine images such as:
                </p>
                <ul className="text-sm text-orange-700 dark:text-orange-400 mt-1 ml-4 list-disc">
                  <li>Medicine tablets or capsules</li>
                  <li>Medicine bottles or containers</li>
                  <li>Medicine packaging or boxes</li>
                  <li>Prescription labels</li>
                  <li>Blister packs or strips</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400 whitespace-pre-line">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !image || validating || !!validationWarning}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
        >
          {validating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Validating Image...
            </>
          ) : loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing Medicine...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze Medicine
            </>
          )}
        </button>
      </form>

      {analysis && (
        <div className="mt-6 space-y-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {analysis.medicineName}
              </h3>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysis.severity)}`}>
                  {analysis.severity} Risk
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.doctorConsultationRequired
                    ? 'bg-orange-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {analysis.doctorConsultationRequired ? 'Doctor Required' : 'Self-Medication OK'}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {analysis.confidence}% Confidence
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Active Ingredients:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.activeIngredients.map((ingredient, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">What it helps with:</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysis.whatItHelps.map((condition, idx) => (
                    <div key={idx} className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <Heart className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-800 dark:text-gray-200">{condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">When & How to Take</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200">Timing</h5>
                </div>
                <div className="space-y-2">
                  {analysis.whenToTake.timing.map((time, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-5 h-5 text-green-600" />
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200">With Food</h5>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{analysis.whenToTake.withFood} meals</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200">Frequency</h5>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{analysis.whenToTake.frequency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Side Effects & Precautions</h3>
            </div>

            <div className="space-y-4">
              {analysis.sideEffects.common.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Common Side Effects:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.sideEffects.common.map((effect, idx) => (
                      <div key={idx} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{effect}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.sideEffects.serious.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Serious Side Effects (Seek immediate help):</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {analysis.sideEffects.serious.map((effect, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">{effect}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.sideEffects.patientSpecific.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Based on your condition:</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {analysis.sideEffects.patientSpecific.map((effect, idx) => (
                      <div key={idx} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{effect}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.precautions.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Important Precautions:</h5>
                  <div className="space-y-2">
                    {analysis.precautions.map((precaution, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">{precaution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {analysis.interactions.length > 0 && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Drug Interactions</h3>
              </div>
              <div className="space-y-2">
                {analysis.interactions.map((interaction, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{interaction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  <strong>Medical Disclaimer:</strong> This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider before starting, stopping, or changing any medication.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

