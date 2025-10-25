# EcoQuest - Gamified Environmental Learning Platform

## Project Overview

EcoQuest is a comprehensive gamified mobile web application designed to make environmental education engaging and interactive for students. The platform combines learning modules, challenges, games, and social features to create an immersive educational experience.

## Features

- **Interactive Learning Modules**: Comprehensive environmental lessons with multimedia content
- **Gamification**: Points, achievements, and progress tracking
- **Social Features**: Leaderboards, challenges, and peer interaction
- **Multi-role Support**: Students, teachers, and school administrators
- **Real-time Analytics**: Track learning progress and engagement
- **Mobile-First Design**: Optimized for mobile devices with responsive design

## Getting Started

To run this project locally, follow these steps:

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase Setup

1) Create a Supabase project and enable Email (magic link) auth.

2) In project Settings > API copy:
- Project URL → set as `VITE_SUPABASE_URL`
- anon public key → set as `VITE_SUPABASE_ANON_KEY`

3) Create a `.env` file (see `.env.example`) with:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4) Database schema & RLS
- The SQL files in `supabase/migrations` contain tables, RLS, and triggers for classes, students, assignments, and submissions.
- Apply these using the Supabase Dashboard SQL editor or via Supabase CLI.

### Using Supabase CLI (optional but recommended)
Install the CLI: see Supabase docs.

Link your project (once):

```
npm run supabase:link
```

Push local migrations to remote:

```
npm run supabase:db:push
```

Regenerate TypeScript types (after DB changes):

```
npm run supabase:types
```

## Auth & Routes
- Teachers sign up with magic link at `/teachers/signup`.
- Teacher dashboard (protected) at `/teacher/dashboard`.
- Students join via `/join/{class_code}` or `/join`.

Environment variables are used to configure the Supabase client; keys are not hardcoded.

## Deployment

This project can be deployed to any static hosting service such as:

- **Vercel**: Connect your GitHub repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Enable GitHub Pages in repository settings
- **Firebase Hosting**: Use Firebase CLI to deploy

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
