# ApexListener

A modern, premium real-time synchronized video platform built with Next.js, Socket.IO, and Supabase.

## Features
- **Real-time Video Sync**: Precise synchronization (within 300ms) for playing, pausing, and seeking.
- **No Login Required**: Instant room creation and anonymous profiles.
- **Premium UI**: Built with Tailwind CSS, Framer Motion, and Glassmorphism.
- **Live Chat**: Real-time chatting with friends in the same room.

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS, Framer Motion, Zustand
- Backend: Node.js, Express, Socket.IO
- Database: Supabase

## Setup Instructions

### Backend Setup
1. Open terminal and navigate to `backend/` folder: `cd backend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. The server will start on `http://localhost:3001`

### Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. Run the SQL statements provided in `backend/setup.sql` in your Supabase SQL Editor.
3. Get your `Project URL` and `anon public` key.

### Frontend Setup
1. Open another terminal and navigate to `frontend/` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the `frontend/` directory with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```
4. Run the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## Deployment
- **Frontend**: Deploy directly on Vercel by importing the `frontend` folder.
- **Backend**: Deploy on Render, Railway, or Heroku by specifying the `backend` folder and running `npm run build` and `npm start`.
