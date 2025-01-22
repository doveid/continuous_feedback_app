# Real-Time Feedback System

A real-time classroom feedback application that enables students to provide instant emotional feedback during lectures, helping professors gauge student understanding and engagement.

## Features

- **Role-Based Access**: Separate interfaces for professors and students
- **Real-Time Feedback**: Instant emotional reactions (Understanding, Difficulties, Interested, Confused)
- **Live Statistics**: Real-time tracking of student responses
- **Secure Access**: Activity-specific access codes for student participation
- **Timeline View**: Chronological display of feedback for professors
- **Session Management**: Time-bound activity sessions

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Updates**: Supabase Realtime
- **Build Tool**: Vite

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utility libraries
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helper functions
│   └── ...
├── backend/               # Backend service (future expansion)
└── supabase/             # Database migrations
```

## Usage

### For Professors

1. Select "Professor" role
2. Create a new activity with title, description, and duration
3. Share the generated access code with students
4. Monitor real-time feedback and statistics

### For Students

1. Select "Student" role
2. Enter the activity access code
3. Provide feedback using the emotion buttons
4. Continue participating until the session ends
