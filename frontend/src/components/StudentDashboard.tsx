import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SmilePlus, Frown as FrownPlus, AlertCircle, HelpCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type Feedback = {
  id: string;
  emotion_type: 'happy' | 'sad' | 'surprised' | 'confused';
  created_at: string;
};

export default function StudentDashboard() {
  const [accessCode, setAccessCode] = useState('');
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    async function setupRealtimeAndFetch() {
      if (!currentActivity) return;

      // Initial fetch
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('activity_id', currentActivity.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error('Error loading feedback', {
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        });
      } else {
        setFeedback(data || []);
      }

      // Create unique channel name
      channel = supabase.channel(`feedback-${currentActivity.id}-${Date.now()}`);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'feedback',
            filter: `activity_id=eq.${currentActivity.id}`,
          },
          (payload) => {
            console.log('New feedback received:', payload);
            setFeedback(prev => [payload.new as Feedback, ...prev]);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to feedback inserts');
          }
        });
    }

    setupRealtimeAndFetch();

    return () => {
      if (channel) {
        console.log('Unsubscribing from channel');
        channel.unsubscribe();
      }
    };
  }, [currentActivity]);

  async function joinActivity(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('access_code', accessCode.toUpperCase())
      .single();

    if (error) {
      toast.error('Invalid access code', {
        className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      });
    } else if (data) {
      const now = new Date();
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);

      if (now < start) {
        toast.error('This activity has not started yet', {
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        });
      } else if (now > end) {
        toast.error('This activity has ended', {
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        });
      } else {
        setCurrentActivity(data);
        toast.success('Joined activity successfully', {
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        });
      }
    }
  }

  async function submitFeedback(emotionType: string) {
    if (!currentActivity) return;

    const { error } = await supabase.from('feedback').insert([
      {
        activity_id: currentActivity.id,
        emotion_type: emotionType,
      },
    ]);

    if (error) {
      toast.error('Error submitting feedback', {
        className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      });
    } else {
      toast.success('Feedback submitted', {
        className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      });
    }
  }

  const getEmotionIcon = (type: string) => {
    switch (type) {
      case 'happy':
        return <SmilePlus className="w-6 h-6 text-green-500" />;
      case 'sad':
        return <FrownPlus className="w-6 h-6 text-red-500" />;
      case 'surprised':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'confused':
        return <HelpCircle className="w-6 h-6 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Toaster
      toastOptions={{
        className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }}
    />
      {!currentActivity ? (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Join an Activity
            </h3>
            <form onSubmit={joinActivity} className="mt-5">
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                  Access Code
                </label>
                <input
                  type="text"
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:dark:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter access code"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Join Activity
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow dark:bg-gray-800 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              {currentActivity.title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-500">{currentActivity.description}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => submitFeedback('happy')}
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <SmilePlus className="w-8 h-8 text-green-500" />
              </button>
              <button
                onClick={() => submitFeedback('sad')}
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <FrownPlus className="w-8 h-8 text-red-500" />
              </button>
              <button
                onClick={() => submitFeedback('surprised')}
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </button>
              <button
                onClick={() => submitFeedback('confused')}
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <HelpCircle className="w-8 h-8 text-purple-500" />
              </button>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Feedback</h4>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-500 py-2"
                  >
                    {getEmotionIcon(item.emotion_type)}
                  </div>
                ))}
                {feedback.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No feedback yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}