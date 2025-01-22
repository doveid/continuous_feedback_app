import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { School, Users } from 'lucide-react';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [selectedRole, setSelectedRole] = useState<'professor' | 'student' | null>(null);

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Proiect TW</h1>
        <div className="flex gap-8">
          <button
            onClick={() => setSelectedRole('professor')}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 space-y-4 w-48"
          >
            <School className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">Professor</span>
          </button>
          <button
            onClick={() => setSelectedRole('student')}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 space-y-4 w-48"
          >
            <Users className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">Students</span>
          </button>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Proiect TW</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setSelectedRole(null)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {selectedRole === 'professor' ? <ProfessorDashboard /> : <StudentDashboard />}
      </main>
      <Toaster />
    </div>
  );
}

export default App;