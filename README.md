# Learning Tracker

A Next.js-based learning management application that helps users track and manage their learning lessons with Supabase integration.

## Features

- **Lesson Management**: Add, edit, and delete lessons
- **Progress Tracking**: KPI display showing total lessons and completion percentage
- **Import/Export**: Export lessons to JSON and import from JSON with bulk database insert
- **Authentication**: User-specific data with Row Level Security (RLS)
- **Real-time Sync**: Data synchronized with Supabase

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS with dark theme

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Set up the database schema by running the SQL in `supabase-schema.sql` in your Supabase SQL editor

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel

3. Add the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. Deploy the application

5. Set up the database schema by running the SQL in `supabase-schema.sql` in your Supabase SQL editor

## Database Schema

The application uses a `lessons` table with the following structure:

- `id`: UUID primary key
- `user_id`: UUID (foreign key to auth.users)
- `title`: Text (required)
- `course`: Text (optional)
- `status`: Text (Todo, Doing, Done, Blocked)
- `priority`: Integer (1-5)
- `tags`: JSONB array
- `notes`: Text (optional)
- `estimate_mins`: Integer (optional)
- `actual_mins`: Integer (optional)
- `unlock_at`: Timestamp (optional)
- `last_reviewed_at`: Timestamp (optional)
- `review_level`: Integer (default 0)
- `next_review_at`: Timestamp (optional)
- `created_at`: Timestamp (auto-generated)
- `updated_at`: Timestamp (auto-updated)

## Security

- Row Level Security (RLS) is enabled
- Users can only access their own lessons
- All database operations are protected by RLS policies

## Import/Export

- **Export**: Downloads all user lessons as a JSON file
- **Import**: Bulk inserts lessons from JSON file into the database
- Import uses the `mapUiToDb` function to properly map UI data to database format
