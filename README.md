# Learning Tracker - GenAI Fundamentals (Next.js • Supabase • Vercel‑ready)

A learning management app designed to help you track and manage your genAI learning journey. Built with Next.js and Supabase for real-time sync across devices, with authentication and secure data storage.

**Live Demo**: [https://genai-learning-tracker.vercel.app/](https://genai-learning-tracker.vercel.app/)

## What's included
- **Full-stack app**: Next.js frontend with Supabase backend
- **Authentication**: Email magic link authentication via Supabase Auth
- **Data storage**: PostgreSQL database with Row Level Security (RLS)
- **Lessons**: title, optional course, **status** (Todo / Doing / Done / Blocked), **priority** (1–5), **tags**, notes, time estimates, and optional **unlock date** (to reveal lessons over time).
- **Spaced review**: Built-in review system with scheduling and review levels
- **Filters**: text search, status, tag, and **Due for review** toggle; **Show future lessons** toggle.
- **KPIs**: quick stats and a progress bar showing learning progress
- **Import/Export JSON**: backup or move your data between devices with bulk database insert
- **Health check**: `/api/health` returns `{ ok: true }` to verify the server is up.

## Perfect For

- **AI/ML Students**: Track your progress through genAI courses and tutorials
- **Self-Learners**: Organize your independent study of generative AI concepts
- **Researchers**: Keep notes on papers, experiments, and findings
- **Developers**: Track your learning as you build genAI applications
- **Educators**: Monitor progress through AI fundamentals curriculum

- **Core Concepts**: Transformers, attention mechanisms, tokenization
- **Model Types**: GPT, BERT, T5, diffusion models, GANs
- **Techniques**: Fine-tuning, prompt engineering, RAG, few-shot learning
- **Applications**: Text generation, image generation, code generation
- **Tools & Frameworks**: Hugging Face, OpenAI API, LangChain, PyTorch
- **Research Papers**: Important papers and their key insights
- **Projects**: Hands-on implementations and experiments

## Tech stack
- **Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Lightweight custom CSS (dark theme)
- **Runtime**: Node.js **≥ 18.17** (Node 20+ recommended)
- **Deployment**: Vercel (auto‑detected Next.js project)

## Quick start

1. **Clone and install**
```bash
git clone <your-repo>
cd learning-tracker-next-stable
npm install
```

2. **Set up environment variables** in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Set up the database** by running the SQL in `supabase-schema.sql` in your Supabase SQL editor

4. **Start development**
```bash
npm run dev
# open http://localhost:3000
# health check: http://localhost:3000/api/health
```

## Deploy to Vercel

1. Push this folder to GitHub/GitLab/Bitbucket.

2. In Vercel, **New Project → Import** your repo.

3. Framework preset: **Next.js** (auto‑detected).

4. **Add environment variables** in Vercel → Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. **Deploy**.

6. **Set up the database** by running the SQL in `supabase-schema.sql` in your Supabase SQL editor

## Database Schema

The application uses a `lessons` table with the following structure:

- `id`: UUID primary key
- `user_id`: UUID (foreign key to auth.users)
- `title`: Text (required) - e.g., "Understanding Attention Mechanisms"
- `course`: Text (optional) - e.g., "Stanford CS224N", "Hugging Face Course"
- `status`: Text (Todo, Doing, Done, Blocked) - Track your progress
- `priority`: Integer (1-5) - Set learning priorities
- `tags`: JSONB array - e.g., ["transformers", "attention", "paper"]
- `notes`: Text (optional) - Your study notes and insights
- `estimate_mins`: Integer (optional) - Time estimate for the lesson
- `actual_mins`: Integer (optional) - Actual time spent
- `unlock_at`: Timestamp (optional) - Schedule when to start
- `last_reviewed_at`: Timestamp (optional) - Last review date
- `review_level`: Integer (default 0) - Spaced repetition level
- `next_review_at`: Timestamp (optional) - Next review scheduled
- `created_at`: Timestamp (auto-generated)
- `updated_at`: Timestamp (auto-updated)

## Usage Tips

### Getting Started
1. **Sign in** with your email (magic link authentication)
2. **Add your first lesson** - Start with a fundamental concept like "What is a Transformer?"
3. **Set priorities** - Mark high-priority topics as priority 1-2
4. **Use tags** - Tag lessons with relevant topics for easy filtering
5. **Track time** - Log how long you spend on each concept

### Organizing Your Learning
- **Group related concepts** using the same course name
- **Use tags** to create topic clusters (e.g., "attention", "embeddings", "fine-tuning")
- **Set review schedules** for concepts you want to reinforce
- **Export your data** regularly as a backup

### Example Lesson Structure
```
Title: "Understanding Self-Attention in Transformers"
Course: "Stanford CS224N"
Status: "Doing"
Priority: 2
Tags: ["transformers", "attention", "mathematics"]
Notes: "Key insight: Attention allows the model to focus on relevant parts of the input..."
Estimate: 120 minutes
```

## File structure
```
app/
  layout.tsx
  page.tsx
  globals.css
  api/
    health/
      route.ts
components/
  AuthGate.tsx
  KPIs.tsx
  LessonForm.tsx
  LessonTable.tsx
  types.ts
  useLocalStorage.ts
lib/
  supabase/
    browser.ts
    server.ts
public/
  favicon.svg
supabase-schema.sql
```

## Security

- Row Level Security (RLS) is enabled
- Users can only access their own lessons
- All database operations are protected by RLS policies
- Authentication required for all data access

## Import/Export

- **Export**: Downloads all your lessons as a JSON file for backup
- **Import**: Bulk imports lessons from JSON file into the database using `mapUiToDb` function
- Import uses proper field mapping to convert UI data to database format

## Troubleshooting
- **Node version**: `node -v` → use ≥ 18.17 (Node 20+ recommended).
- **Clean install**:
  ```bash
  rm -rf node_modules .next package-lock.json pnpm-lock.yaml yarn.lock
  npm install
  npm run dev
  ```
- **Port conflict**: try `PORT=3001 npm run dev`.
- **Next cache**: `rm -rf .next && npm run dev`.
- **Browser console**: look for runtime errors.
- **Health check**: confirm `/api/health` returns `{ ok: true }`.
- **Supabase connection**: Check environment variables and database schema setup.
- **Magic link pointing to localhost**: If magic link emails point to `localhost:3000` instead of your production URL:
  1. Go to your Supabase project dashboard
  2. Navigate to **Authentication** → **URL Configuration**
  3. Update **Site URL** to your production URL (e.g., `https://your-app.vercel.app`)
  4. Add your production URL to **Redirect URLs** if not already present
  5. Save the changes

## License
MIT
