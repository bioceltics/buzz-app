import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, Image, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const steps = [
  { id: 'basics', name: 'Basic Info', icon: Building2 },
  { id: 'location', name: 'Location', icon: MapPin },
  { id: 'hours', name: 'Hours', icon: Clock },
  { id: 'photos', name: 'Photos', icon: Image },
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submit
      console.log('Venue data:', data);
      toast.success('Venue submitted for approval!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500">Buzzee</h1>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Set up your venue</h2>
          <p className="text-gray-600 mt-2">
            Complete these steps to start promoting your business
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 flex items-center ${
                index < steps.length - 1 ? 'after:content-[""] after:flex-1 after:h-0.5 after:mx-2' : ''
              } ${index < steps.length - 1 ? (index <= currentStep ? 'after:bg-primary-500' : 'after:bg-gray-200') : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-primary-500 text-white'
                    : index === currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div>
                <label className="label">Venue Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., The Keg Steakhouse"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <label className="label">Venue Type</label>
                <select className="input" {...register('type', { required: true })}>
                  <option value="">Select type...</option>
                  <option value="bar">Bar</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="club">Club</option>
                  <option value="hotel">Hotel</option>
                  <option value="cafe">Cafe</option>
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="Tell customers what makes your venue special..."
                  {...register('description')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="+1 (604) 555-0000" {...register('phone')} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input type="url" className="input" placeholder="https://..." {...register('website')} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div>
                <label className="label">Street Address</label>
                <input type="text" className="input" placeholder="123 Granville St" {...register('address')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input type="text" className="input" defaultValue="Vancouver" {...register('city')} />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input type="text" className="input" placeholder="V6B 2B2" {...register('postalCode')} />
                </div>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map preview will appear here</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-24 text-gray-700">{day}</span>
                  <input type="time" className="input w-32" {...register(`hours.${day}.open`)} />
                  <span className="text-gray-500">to</span>
                  <input type="time" className="input w-32" {...register(`hours.${day}.close`)} />
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" {...register(`hours.${day}.closed`)} />
                    <span className="ml-2 text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
              <div>
                <label className="label">Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              </div>
              <div>
                <label className="label">Cover Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                  <p className="text-sm text-gray-400">Recommended: 1200x400px</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button type="submit" className="btn btn-primary">
              {currentStep === steps.length - 1 ? 'Submit for Approval' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
