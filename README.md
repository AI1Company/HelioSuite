# HelioSuite

AI-powered SaaS platform for solar installation companies in South Africa.

## Project Overview

HelioSuite is a comprehensive platform that streamlines solar installation business operations through:

- **CRM & Lead Management**: Track leads, manage customer relationships
- **AI-Powered Proposals**: Generate professional proposals using GPT-4 and LangChain
- **Mobile Field Operations**: Offline-first React Native app for technicians
- **Project Management**: End-to-end job tracking and billing workflows

## Technology Stack

- **Frontend**: React + TailwindCSS (Web), React Native + Expo (Mobile)
- **Backend**: Firebase (Auth, Firestore, Functions, Hosting)
- **AI**: OpenAI GPT-4 + LangChain for proposal generation
- **Development**: TypeScript, ESLint, Prettier, Vitest

## Project Structure

```
HelioSuite/
├── web/                 # React web dashboard
├── mobile/              # React Native mobile app
├── functions/           # Firebase Cloud Functions
├── shared/              # Shared utilities and types
├── src/                 # Core application logic
└── docs/                # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Some Firebase tools require Node.js 20+)
- npm or yarn
- Firebase CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HelioSuite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. Start development servers:
```bash
# Web dashboard
npm run dev:web

# Mobile app
npm run dev:mobile

# Firebase functions
npm run dev:functions
```

## Development Status

### ✅ Completed
- [x] Project structure setup
- [x] Firebase configuration
- [x] Development tooling (ESLint, Prettier, TypeScript)
- [x] Basic web app scaffold

### 🔄 In Progress
- [ ] Dependency installation (network issues)
- [ ] Firebase security rules
- [ ] Database schema design

### ⏳ Planned
- [ ] Authentication system
- [ ] CRM module
- [ ] AI proposal engine
- [ ] Mobile app development
- [ ] Testing framework
- [ ] Production deployment

## Contributing

Please read the development standards in `devdocs/` before contributing.

## License

MIT License - see LICENSE file for details.