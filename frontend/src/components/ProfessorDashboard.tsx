import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { SmilePlus, Frown, AlertCircle, HelpCircle } from 'lucide-react';

type Activity = {
  id: string;
  title: string;
  description: string;
  access_code: string;
  start_time: string;
  end_time: string;
};

type Feedback = {
  id: string;
  emotion_type: 'happy' | 'sad' | 'surprised' | 'confused';
  created_at: string;
};

type Notification = {
  id: string;
  emotion_type: 'happy' | 'sad' | 'surprised' | 'confused';
  timestamp: number;
};

export default function ProfessorDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [view, setView] = useState<'create' | 'view'>('create');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Clean up expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(n => n.timestamp > Date.now() - 2000)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    async function setupRealtimeAndFetch() {
      if (!selectedActivity) return;

      // Initial fetch
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('activity_id', selectedActivity.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error('Error loading feedback');
      } else {
        setFeedback(data || []);
      }

      // Create unique channel name
      channel = supabase.channel(`feedback-${selectedActivity.id}-${Date.now()}`);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',  // doar INSERT
            schema: 'public',
            table: 'feedback',
            filter: `activity_id=eq.${selectedActivity.id}`,
          },
          (payload) => {
            console.log('New feedback received:', payload);
            
            // Adaugă noul feedback la începutul listei
            setFeedback(prev => [payload.new as Feedback, ...prev]);
            
            // Actualizează notificările
            setNotifications(prev => [...prev, {
              id: Math.random().toString(),
              emotion_type: (payload.new as Feedback).emotion_type,
              timestamp: Date.now()
            }]);
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
  }, [selectedActivity]);

  async function loadActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading activities');
    } else {
      setActivities(data || []);
    }
  }

  async function createActivity(e: React.FormEvent) {
    e.preventDefault();

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase.from('activities').insert([
      {
        title,
        description,
        access_code: accessCode,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      },
    ]);

    if (error) {
      toast.error('Error creating activity');
    } else {
      toast.success('Activity created successfully');
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      loadActivities();
    }
  }

  const getEmotionIcon = (type: string) => {
    switch (type) {
      case 'happy':
        return <SmilePlus className="w-6 h-6 text-green-500" />;
      case 'sad':
        return <Frown className="w-6 h-6 text-red-500" />;
      case 'surprised':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'confused':
        return <HelpCircle className="w-6 h-6 text-purple-500" />;
      default:
        return null;
    }
  };

  const isActivityActive = (activity: Activity) => {
    const now = new Date();
    const start = new Date(activity.start_time);
    const end = new Date(activity.end_time);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800"
            style={{
              animation: 'fadeOut 2s forwards',
              opacity: Math.max(0, 1 - (Date.now() - notification.timestamp) / 3000)
            }}
          >
            {getEmotionIcon(notification.emotion_type)}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setView('create')}
          className={`px-4 py-2 rounded-md ${
            view === 'create'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50'
          }`}
        >
          Create Activity
        </button>
        <button
          onClick={() => setView('view')}
          className={`px-4 py-2 rounded-md ${
            view === 'view'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50'
          }`}
        >
          View Feedback
        </button>
      </div>

      {view === 'create' ? (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Create New Activity
            </h3>
            <form onSubmit={createActivity} className="mt-5 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-white">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Activity
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Activities
              </h3>
              <div className="mt-5 space-y-4">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`w-full text-left border rounded-lg p-4 transition-colors duration-0 ${
                      selectedActivity?.id === activity.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-200 dark:border-gray-500 hover:bg-gray-200 hover:dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">{activity.title}</h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isActivityActive(activity)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isActivityActive(activity) ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Code: {activity.access_code}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedActivity && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Feedback for {selectedActivity.title}
                </h3>
                <div className="mt-5">
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-gray-200 dark:border-gray-500 py-2"
                      >
                        {getEmotionIcon(item.emotion_type)}
                        <span className="text-sm text-gray-500">
                          {format(new Date(item.created_at), 'HH:mm:ss')}
                        </span>
                      </div>
                    ))}
                  </div>
                  {feedback.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No feedback received yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}