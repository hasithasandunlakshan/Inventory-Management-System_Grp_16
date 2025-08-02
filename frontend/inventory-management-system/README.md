# Inventory Management System Frontend

A modern Next.js frontend for the Inventory Management System with TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🚀 Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🧩 shadcn/ui components
- 📱 Responsive design
- 🔍 Product search and management
- ✅ TypeScript for type safety
- 🎯 ESLint and Prettier for code quality

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend/inventory-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Code Quality

### Pre-commit Hooks

The project uses Husky to run pre-commit hooks that:
- Format code with Prettier
- Run ESLint checks
- Perform TypeScript type checking

### CI/CD Pipeline

The project includes GitHub Actions workflows:

1. **CI Pipeline** (`.github/workflows/ci.yml`):
   - Runs on push to main/develop and pull requests
   - Installs dependencies
   - Runs linting and type checking
   - Builds the application
   - Uploads build artifacts

2. **Deployment Pipeline** (`.github/workflows/deploy.yml`):
   - Runs on push to main branch
   - Deploys to Vercel (requires secrets configuration)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── products/        # Product management pages
│   └── globals.css      # Global styles
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and services
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   └── utils.ts        # Utility functions
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically via GitHub Actions

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run code quality checks:
```bash
npm run format
npm run lint
npm run type-check
```
5. Commit your changes (pre-commit hooks will run automatically)
6. Push to your branch and create a pull request

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
