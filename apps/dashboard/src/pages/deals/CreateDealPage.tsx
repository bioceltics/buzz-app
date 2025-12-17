import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, Image, Video, Plus, Sparkles, Wand2, Copy, CheckCircle, Lightbulb, TrendingUp, Hash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { generateDealContent, DealContentInput, GeneratedContent } from '@/services/ai';

interface DealForm {
  title: string;
  description: string;
  type: string;
  discountType: string;
  discountValue: number;
  originalPrice: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  terms: string;
  maxRedemptions: number;
  isRecurring: boolean;
  recurringDays: number[];
  category: string;
  itemName: string;
}

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export function CreateDealPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [aiContent, setAiContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { venue } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealForm>();

  const dealType = watch('type');
  const isRecurring = watch('isRecurring');
  const discountType = watch('discountType');
  const discountValue = watch('discountValue');
  const category = watch('category');
  const itemName = watch('itemName');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: MediaFile[] = [];

    Array.from(files).forEach((file) => {
      if (mediaFiles.length + newFiles.length >= 5) {
        toast.error('Maximum 5 media files allowed');
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error('Only images and videos are allowed');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
      });
    });

    setMediaFiles([...mediaFiles, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter((m) => m.id !== id));
  };

  // AI Content Generation
  const generateAIContent = async () => {
    if (!venue) {
      toast.error('Venue information not available');
      return;
    }

    setIsGenerating(true);
    setShowAiPanel(true);

    try {
      const input: DealContentInput = {
        venueType: (venue.type as any) || 'restaurant',
        venueName: venue.name || 'Your Venue',
        dealType: mapDealType(dealType),
        category: (category as any) || 'food',
        discountValue: discountValue || 20,
        discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
        itemName: itemName || undefined,
        timeSlot: getTimeSlot(),
        mood: 'casual',
      };

      const content = await generateDealContent(input);
      setAiContent(content);
      toast.success('AI suggestions generated!');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const mapDealType = (type: string): DealContentInput['dealType'] => {
    const mapping: Record<string, DealContentInput['dealType']> = {
      'happy_hour': 'happyHour',
      'flash_deal': 'discount',
      'recurring': 'discount',
      'event': 'event',
    };
    return mapping[type] || 'discount';
  };

  const getTimeSlot = (): DealContentInput['timeSlot'] => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 14) return 'lunch';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const copyToField = (text: string, field: 'title' | 'description') => {
    setValue(field, text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`);
  };

  const onSubmit = async (data: DealForm) => {
    if (!venue?.id) {
      toast.error('No venue found. Please complete onboarding first.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      // Combine date and time into ISO strings
      const startTime = new Date(`${data.startDate}T${data.startTime}`).toISOString();
      const endTime = new Date(`${data.endDate}T${data.endTime}`).toISOString();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          venue_id: venue.id,
          title: data.title,
          description: data.description,
          type: data.type || 'flash_deal',
          discount_type: data.discountType || 'percentage',
          discount_value: data.discountValue || undefined,
          original_price: data.originalPrice || undefined,
          start_time: startTime,
          end_time: endTime,
          terms: data.terms || undefined,
          max_redemptions: data.maxRedemptions || undefined,
          recurring_days: data.isRecurring ? data.recurringDays : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deal');
      }

      toast.success('Deal created successfully!');
      navigate('/deals');
    } catch (error) {
      console.error('Create deal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Deals
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
          <p className="text-gray-600">Set up a new promotion for your customers</p>
        </div>
        <button
          type="button"
          onClick={generateAIContent}
          disabled={isGenerating}
          className="btn btn-outline flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400 text-purple-700"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          AI Assistant
        </button>
      </div>

      <div className="flex gap-8">
        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
          {/* Basic Info */}
          <div className="card overflow-visible">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="label flex items-center justify-between">
                  <span>Deal Title</span>
                  {copiedField === 'title' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Updated from AI
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g., Happy Hour Special"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span>Description</span>
                  {copiedField === 'description' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Updated from AI
                    </span>
                  )}
                </label>
                <textarea
                  className="input w-full min-h-[100px] resize-y"
                  placeholder="Describe your deal..."
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Deal Type</label>
                  <select className="input w-full" {...register('type', { required: true })}>
                    <option value="">Select type...</option>
                    <option value="happy_hour">Happy Hour</option>
                    <option value="flash_deal">Flash Deal</option>
                    <option value="recurring">Recurring Special</option>
                    <option value="event">Event Special</option>
                  </select>
                </div>

                <div>
                  <label className="label">Category</label>
                  <select className="input w-full" {...register('category')}>
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="entry">Entry</option>
                    <option value="experience">Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Item Name (Optional)</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Margaritas, Appetizers, VIP Entry"
                  {...register('itemName')}
                />
                <p className="mt-1 text-xs text-gray-400">Specific item helps AI generate better content</p>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="card overflow-visible">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deal Media</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add photos or videos to make your deal more attractive. The first image will be used as the cover.
            </p>

            {/* Media Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {mediaFiles.map((media, index) => (
                <div
                  key={media.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 group"
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.preview}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Cover badge for first image */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded">
                      Cover
                    </div>
                  )}
                  {/* Type indicator */}
                  <div className="absolute bottom-2 left-2">
                    {media.type === 'image' ? (
                      <Image className="w-4 h-4 text-white drop-shadow-lg" />
                    ) : (
                      <Video className="w-4 h-4 text-white drop-shadow-lg" />
                    )}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {mediaFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Add Media</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Image className="w-3 h-3" />
                Images: JPG, PNG, GIF
              </span>
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                Videos: MP4, MOV (max 50MB)
              </span>
              <span>{mediaFiles.length}/5 files</span>
            </div>
          </div>

          {/* Discount Details */}
          <div className="card overflow-visible">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Discount Type</label>
                <select className="input w-full" {...register('discountType')}>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="free_item">Free Item</option>
                </select>
              </div>

              <div>
                <label className="label">Discount Value</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g., 20"
                  {...register('discountValue', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="label">Original Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input w-full"
                  placeholder="0.00"
                  {...register('originalPrice', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Daily Redemption Limit */}
          <div className="card overflow-visible">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Redemption Limit</h3>
            <p className="text-sm text-gray-500 mb-4">
              Control how many customers can redeem this deal. When the limit is reached, the deal automatically becomes unavailable.
            </p>

            <div>
              <label className="label">Available Spots</label>
              <input
                type="number"
                className="input w-full sm:max-w-xs"
                placeholder="e.g., 50 (leave blank for unlimited)"
                {...register('maxRedemptions', { valueAsNumber: true })}
              />
              <p className="mt-1 text-xs text-gray-400">Leave blank for unlimited redemptions</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="card overflow-visible">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule</h3>
            <p className="text-sm text-gray-500 mb-4">
              Set when your deal goes live and when it ends. The deal will automatically start and stop at these times.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm text-green-700">
                    <strong>Tip:</strong> You can pause or stop any live deal at any time from the Deals dashboard.
                  </p>
                </div>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input w-full" {...register('startDate')} />
              </div>
              <div>
                <label className="label">Start Time</label>
                <input type="time" className="input w-full" {...register('startTime')} />
                <p className="mt-1 text-xs text-gray-400">Deal goes live at this time</p>
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" className="input w-full" {...register('endDate')} />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="time" className="input w-full" {...register('endTime')} />
                <p className="mt-1 text-xs text-gray-400">Deal expires at this time</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 flex-shrink-0"
                  {...register('isRecurring')}
                />
                <span className="ml-2 text-sm text-gray-700">This is a recurring deal</span>
              </label>
            </div>

            {isRecurring && (
              <div className="mt-4">
                <label className="label">Recurring Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <label
                      key={day}
                      className="flex items-center justify-center w-11 h-11 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={index}
                        className="sr-only"
                        {...register('recurringDays')}
                      />
                      <span className="text-sm font-medium">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="card overflow-visible">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
            <textarea
              className="input w-full min-h-[100px] resize-y"
              placeholder="Add any terms and conditions..."
              {...register('terms')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Deal'
              )}
            </button>
          </div>
        </form>

        {/* AI Suggestions Panel */}
        {showAiPanel && (
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              <div className="card p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
                    <p className="text-xs text-gray-500">Click to use</p>
                  </div>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="ml-auto p-1 hover:bg-white/50 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {isGenerating ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                  </div>
                ) : aiContent ? (
                  <div className="space-y-4">
                    {/* Estimated Engagement */}
                    <div className={`p-3 rounded-lg ${
                      aiContent.estimatedEngagement === 'high' ? 'bg-green-100' :
                      aiContent.estimatedEngagement === 'medium' ? 'bg-amber-100' :
                      'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${
                          aiContent.estimatedEngagement === 'high' ? 'text-green-600' :
                          aiContent.estimatedEngagement === 'medium' ? 'text-amber-600' :
                          'text-gray-600'
                        }`} />
                        <span className="text-sm font-medium capitalize">
                          {aiContent.estimatedEngagement} engagement potential
                        </span>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Title Ideas</h4>
                      <div className="space-y-2">
                        {aiContent.titles.slice(0, 4).map((title, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => copyToField(title, 'title')}
                            className="w-full text-left p-2 text-sm bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center gap-2 group"
                          >
                            <span className="flex-1">{title}</span>
                            <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description Ideas</h4>
                      <div className="space-y-2">
                        {aiContent.descriptions.slice(0, 3).map((desc, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => copyToField(desc, 'description')}
                            className="w-full text-left p-2 text-sm bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                          >
                            <span className="line-clamp-2">{desc}</span>
                            <div className="flex justify-end mt-1">
                              <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Suggested Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {aiContent.hashtags.slice(0, 6).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white text-xs text-purple-600 rounded-full border border-purple-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Tips for Better Results
                      </h4>
                      <div className="space-y-2">
                        {aiContent.tips.slice(0, 3).map((tip, i) => (
                          <div
                            key={i}
                            className="p-2 text-xs text-gray-600 bg-white rounded-lg border border-gray-200"
                          >
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Call to Action</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiContent.callToAction.slice(0, 3).map((cta, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white text-xs text-gray-600 rounded border border-gray-200"
                          >
                            {cta}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={generateAIContent}
                      className="w-full btn btn-outline text-sm py-2"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Regenerate
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Fill in deal details and click "AI Assistant" to get suggestions
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
