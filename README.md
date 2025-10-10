# Smart Wardrobe App

A comprehensive wardrobe management application with AI-powered outfit suggestions, weather integration, and marketplace features.

## Project info

**URL**: https://lovable.dev/projects/b9ff32bc-031e-4a86-901c-0de2f28baa51

## Features

- 👔 Digital wardrobe management
- 🤖 AI-powered outfit suggestions
- 🌤️ Weather-based recommendations
- 📊 Analytics and insights
- 🛍️ Marketplace for buying/selling
- 🌱 Sustainability tracking
- 📱 Mobile-responsive design

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **State Management**: Zustand + React Query
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b9ff32bc-031e-4a86-901c-0de2f28baa51) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

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

### Environment Setup

The project uses Supabase for backend services. The connection details are already configured in:
- `src/integrations/supabase/client.ts` - Supabase client configuration
- `.env` - Environment variables (auto-generated)

**Required Services:**
- Supabase project with configured database, auth, and storage
- Edge functions deployed for AI features, weather, and payments

### Port Configuration

The development server runs on port 8080 by default (configured in `vite.config.ts`).

### Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React contexts (Auth, etc.)
├── hooks/             # Custom React hooks
│   └── queries/       # React Query data-fetching hooks
├── integrations/      # External service integrations
├── lib/              # Utility functions and shared logic
├── pages/            # Route components
├── routes/           # Route configuration
├── stores/           # Zustand state stores
└── utils/            # Helper utilities

supabase/
├── functions/        # Edge functions
└── migrations/       # Database migrations
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

## Development Scripts

```sh
npm run dev          # Start development server on port 8080
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## What technologies are used for this project?

This project is built with:

- **Build & Dev**: Vite
- **Language**: TypeScript
- **Framework**: React 18
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Backend**: Supabase
- **Deployment**: Lovable Platform

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b9ff32bc-031e-4a86-901c-0de2f28baa51) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
