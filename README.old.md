# FarmNexus Frontend

A React-based frontend for the FarmNexus appointment booking platform.

## Getting Started

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

## Project Structure

```
farmnexus-frontend/
├── public/           # Static HTML and assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page-level components
│   ├── services/     # API service modules (Axios)
│   ├── utils/        # Helper functions & constants
│   ├── App.js        # Root component with routing
│   └── index.js      # React entry point
└── package.json
```

## Tech Stack
- React 18
- React Router v6
- Axios (API calls)
- JWT Decode (token parsing)
